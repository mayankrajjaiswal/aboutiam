import { test, expect } from '@playwright/test'

test.describe('AboutIAM Academy & Practical Security Labs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.07.28' } }))
    })
    await page.reload()
    
    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // Modal didn't pop up or was already dismissed
    }
  })

  test('should navigate through Beginner Primer & Learning Pathways', async ({ page }) => {
    // Go to Beginner's Primer
    await page.goto('http://localhost:5173/primer')
    await expect(page.locator('h2')).toContainText("New to Identity?")
    await expect(page.locator('div:has-text("digital bouncer of the internet")').first()).toBeVisible()

    // Go to Learning Roadmap / Pathways
    await page.goto('http://localhost:5173/roadmap')
    await expect(page.locator('h1').or(page.locator('h2')).first()).toContainText("Roadmap")
    await expect(page.locator('span:has-text("Recommended Sequence")').first()).toBeVisible()
  })

  test('should load the IAM Academy, expand tracks and complete modules', async ({ page }) => {
    await page.goto('http://localhost:5173/learn')
    await expect(page.locator('h2')).toContainText("Central Academy Curriculum")

    // The first track (Foundations of Identity) is usually loaded. Expand the first track:
    const trackBtn = page.locator('button:has-text("Foundations of Identity")').first()
    await expect(trackBtn).toBeVisible()
    await trackBtn.click()

    // Check module visibility within expanded track
    const moduleItem = page.locator('button:has-text("Identity vs. Account")').first().or(page.locator('button:has-text("Module")').first())
    await expect(moduleItem).toBeVisible()

    // Mark module as completed
    const markCompleteBtn = page.locator('button:has-text("Mark Completed")').first()
    if (await markCompleteBtn.isVisible()) {
      await markCompleteBtn.click()
      await expect(page.locator('button:has-text("Completed")').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('should enter an Identity Lab, reveal hints, adjust configuration and run pen-tests', async ({ page }) => {
    await page.goto('http://localhost:5173/labs')
    await expect(page.locator('h1')).toContainText("Interactive Identity Labs")

    // Assert that standard difficulty filter buttons exist
    await expect(page.locator('button:has-text("Beginner")').first()).toBeVisible()

    // Start a secure lab (the first available lab, typically Lab 1)
    const startLabBtn = page.locator('button:has-text("Start Secure Lab")').first()
    await expect(startLabBtn).toBeVisible()
    await startLabBtn.click()

    // We should now be in the Lab interface
    await expect(page.locator('button:has-text("Back to Academy Dashboard")')).toBeVisible({ timeout: 5000 })

    // Click "Reveal Hint"
    const hintBtn = page.locator('button:has-text("Reveal Hint")')
    if (await hintBtn.isVisible()) {
      await hintBtn.click()
      // Hint text should be displayed
      await expect(page.locator('strong:has-text("Hint")').first()).toBeVisible()
    }

    // Execute Automated Pen-Test Audit
    const auditBtn = page.locator('button:has-text("Execute Automated Pen-Test")').or(page.locator('button:has-text("Audit")')).first()
    await expect(auditBtn).toBeVisible()
    await auditBtn.click()

    // Expect simulation logs to output, and check if it completed or is running
    await expect(page.locator('div.font-mono').first()).toBeVisible({ timeout: 10000 })
  })

  test('should load the Daily Identity Puzzle page', async ({ page }) => {
    await page.goto('http://localhost:5173/daily-puzzle')
    await expect(page.locator('h2')).toContainText("One IAM Puzzle a Day")

    // The puzzle description and elements should mount
    await expect(page.locator('div:has-text("Attempts:")').first().or(page.locator('div:has-text("Attempt")').first())).toBeVisible()
  })
})
