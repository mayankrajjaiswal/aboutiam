import { test, expect } from '@playwright/test'

test.describe('AboutIAM GRC Maturity & Architecture Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should successfully run a full GRC Maturity Self-Assessment', async ({ page }) => {
    await page.goto('http://localhost:5173/assess')
    await expect(page.locator('h2')).toContainText('GRC Maturity Assessment')

    // Click Begin Self-Assessment
    const beginBtn = page.locator('button:has-text("Begin Self-Assessment")')
    await expect(beginBtn).toBeVisible()
    await beginBtn.click()

    // Answer questions by selecting the first option on each step
    // There are several questions across 5 pillars
    const totalSteps = 25 // 5 questions per pillar * 5 pillars
    for (let i = 0; i < totalSteps; i++) {
      // Find the option buttons and click the first one
      const optionBtn = page.locator('button[class*="bg-slate-900"]').first().or(page.locator('button[class*="bg-bg-card"]').first())
      await expect(optionBtn).toBeVisible({ timeout: 5000 })
      await optionBtn.click()

      // Click Next Step (or Analyze Maturity Report on the last step)
      const nextBtn = page.locator('button:has-text("Next Step")').or(page.locator('button:has-text("Analyze Maturity Report")'))
      await expect(nextBtn).toBeVisible()
      await nextBtn.click()
    }

    // Expect the GRC maturity report layout or percentile estimation to be visible
    await expect(page.locator('h3:has-text("Maturity Level Scoreboard")').or(page.locator('div:has-text("Maturity Report")')).or(page.locator('div:has-text("Maturity Score")'))).toBeVisible({ timeout: 8000 })
    
    // Expect the export/share action buttons to be visible
    await expect(page.locator('button:has-text("Download SVG Roadmap")')).toBeVisible()
  })

  test('should load reference architectures and execute handshake simulation', async ({ page }) => {
    await page.goto('http://localhost:5173/architecture')
    await expect(page.locator('h2')).toContainText('Reference Architecture Center')

    // The default selected architecture should have a "Run Simulation Handshake" button
    const runSimBtn = page.locator('button:has-text("Run Simulation Handshake")')
    await expect(runSimBtn).toBeVisible()
    await runSimBtn.click()

    // Expect the button to toggle to "Simulating..."
    await expect(page.locator('button:has-text("Simulating...")')).toBeVisible()

    // Expect trace logs to start populating in the side panel
    const logContainer = page.locator('div.font-mono')
    await expect(logContainer).not.toContainText('No active handshake trace', { timeout: 8000 })
  })

  test('should load threat modeling studio with active templates', async ({ page }) => {
    await page.goto('http://localhost:5173/threat-modeling')
    await expect(page.locator('h2')).toContainText('Threat Modeling Studio')

    // Assert STRIDE validations or topology diagram is loaded
    const templatesList = page.locator('button:has-text("Load Template")').or(page.locator('div:has-text("Template")')).first()
    await expect(templatesList).toBeVisible()
  })

  test('should load decision matrix protocol recommender', async ({ page }) => {
    await page.goto('http://localhost:5173/decision-matrix')
    await expect(page.locator('h2')).toContainText('Identity Decision Matrix')

    // Click on some question or select dropdowns to get recommendations
    const appTypeSelect = page.locator('select').first()
    if (await appTypeSelect.isVisible()) {
      await appTypeSelect.selectOption({ index: 1 })
      await expect(page.locator('div:has-text("Recommendation")').or(page.locator('div:has-text("Protocol")')).first()).toBeVisible()
    }
  })
})
