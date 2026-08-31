import { test, expect } from '@playwright/test'

test.describe('AboutIAM Search Bar & Command Palette Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.07.28' } }))
    })
    await page.reload()
  })

  test('should trigger search modal using keyboard shortcut Ctrl+K', async ({ page }) => {
    // Focus page
    await page.locator('h1').first().click()
    // Trigger keyboard shortcut
    await page.keyboard.press('Control+k')
    
    // Command palette should become visible
    const modalInput = page.locator('input[placeholder*="Search tools"]')
    await expect(modalInput).toBeVisible({ timeout: 5000 })
  })

  test('should successfully search for new and old security tools', async ({ page }) => {
    await page.locator('h1').first().click()
    await page.keyboard.press('Control+k')
    const modalInput = page.locator('input[placeholder*="Search tools"]')
    await expect(modalInput).toBeVisible()

    // 1. Search for an old tool (JWT Decoder)
    await modalInput.fill('JWT Decoder')
    await expect(page.locator('div:has-text("JWT Decoder — Inspect & Verify")').first()).toBeVisible({ timeout: 5000 })

    // Clear search input
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')

    // 2. Search for a new Phase 8 tool (SAML Metadata Auditor)
    await modalInput.fill('SAML Metadata')
    await expect(page.locator('div:has-text("SAML 2.0 Metadata Schema Auditor")').first()).toBeVisible({ timeout: 5000 })

    // Clear search input
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')

    // 3. Search for a new Phase 8 playground (DPoP)
    await modalInput.fill('DPoP')
    await expect(page.locator('div:has-text("DPoP (Proof-of-Possession) Sandbox")').first()).toBeVisible({ timeout: 5000 })
  })
})
