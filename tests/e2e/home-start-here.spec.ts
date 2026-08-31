import { test, expect } from '@playwright/test'

test.describe('AboutIAM Home & User Onboarding Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.07.28' } }))
    })
    await page.reload()
  })

  test('should load the home page successfully with hero and daily widgets', async ({ page }) => {
    // Assert main header titles
    await expect(page.locator('h1')).toContainText('Master Identity & Access')
    
    // Check "Fact of the Day" widget
    await expect(page.locator('h3:has-text("Fact of the Day")').first()).toBeVisible()
    
    // Check "Daily Identity Puzzle" widget
    await expect(page.locator('h3:has-text("Daily Identity Puzzle")').or(page.locator('span:has-text("Daily Puzzle")')).first()).toBeVisible()
  })

  test('should run the Start Here goal-based routing wizard', async ({ page }) => {
    // Open the wizard
    const startHereBtn = page.locator('button:has-text("Not sure where to start?")')
    await expect(startHereBtn).toBeVisible()
    await startHereBtn.click()

    // The wizard overlay should be visible
    await expect(page.locator('p:has-text("What brings you here today?")')).toBeVisible()

    // Click on the first goal button
    const goalBtn = page.locator('button:has-text("Learn IAM fundamentals")').or(page.locator('button:has-text("Prep for an interview")')).first()
    await expect(goalBtn).toBeVisible()
    await goalBtn.click()

    // Expect the path items to be shown
    await expect(page.locator('p:has-text("Your path:")')).toBeVisible()
    
    // Close the wizard
    const closeBtn = page.locator('button[aria-label="Close start here wizard"]')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    
    await expect(page.locator('p:has-text("What brings you here today?")')).not.toBeVisible()
  })

  test('should allow exporting a user profile locally', async ({ page }) => {
    await page.evaluate(() => {
      // Seed local storage with mock data so export contains something
      localStorage.setItem('aboutiam-academy-progress', '{"completedModules":["module-1"]}')
    })
    
    await page.reload()

    // Scroll to the profile cards
    const exportCard = page.locator('h3:has-text("Export / Import My Profile")')
    await expect(exportCard).toBeVisible()
    
    const exportBtn = page.locator('button:has-text("Export Profile")')
    await expect(exportBtn).toBeVisible()

    // Download the profile backup file
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click()
    ])

    const filename = download.suggestedFilename()
    expect(filename).toContain('aboutiam-profile-')
    expect(filename).toContain('.json')
  })
})
