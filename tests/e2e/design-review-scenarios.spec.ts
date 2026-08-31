import { test, expect } from '@playwright/test'

test.describe('AboutIAM Design Review & Scenario Builder', () => {
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

  test('should successfully go through the Scenario Builder questionnaire and generate results', async ({ page }) => {
    await page.goto('http://localhost:5173/scenario-builder')

    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // Modal didn't pop up or was already dismissed
    }

    await expect(page.locator('h1')).toContainText('Identity Scenario Builder')

    // Step 0: Organization Type selection. Choose "Enterprise"
    const enterpriseBtn = page.locator('button:has-text("Enterprise")').first()
    await expect(enterpriseBtn).toBeVisible()
    await enterpriseBtn.click()

    // Go to Step 1
    const nextBtn1 = page.locator('button:has-text("Next Step")')
    await expect(nextBtn1).toBeVisible()
    await nextBtn1.click()

    // Step 1: Scale & Directories. Choose massive scale
    const scaleSelect = page.locator('select').first()
    if (await scaleSelect.isVisible()) {
      await scaleSelect.selectOption('massive')
    }

    // Go to Step 2
    const nextBtn2 = page.locator('button:has-text("Next Step")')
    await expect(nextBtn2).toBeVisible()
    await nextBtn2.click()

    // Step 2: Advanced Security Controls. Toggle passwordless check if present
    const pwLessCheck = page.locator('input[type="checkbox"]').nth(1).or(page.locator('button[role="checkbox"]').nth(1)).first()
    if (await pwLessCheck.isVisible()) {
      await pwLessCheck.click()
    }

    // Generate Results
    const generateBtn = page.locator('button:has-text("Generate Architecture Blueprint")').first()
    await expect(generateBtn).toBeVisible()
    await generateBtn.click()

    // Results panel should appear. Expect threat model or sequence layout title
    await expect(page.locator('span:has-text("Generated Architecture Blueprint")').or(page.locator('h2:has-text("Secure Architecture")')).first()).toBeVisible({ timeout: 10000 })

    // We should be able to toggle policy tab
    const awsTab = page.locator('button:has-text("AWS Policy")').or(page.locator('button:has-text("AWS")')).first()
    if (await awsTab.isVisible()) {
      await awsTab.click()
      await expect(page.locator('pre').first()).toBeVisible()
    }
  })

  test('should execute automated reviews and custom blueprints in Design Review Assistant', async ({ page }) => {
    await page.goto('http://localhost:5173/design-review')

    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // Modal didn't pop up or was already dismissed
    }

    await expect(page.locator('h1')).toContainText('IAM Design Review Assistant')

    // Select a corporate template and click Analyze Design
    const templateBtn = page.locator('select').first()
    if (await templateBtn.isVisible()) {
      await templateBtn.selectOption({ index: 1 })
    }

    const analyzeBtn = page.locator('button:has-text("Analyze Design Architecture")').first()
    await expect(analyzeBtn).toBeVisible()
    await analyzeBtn.click()

    // Analysis results card should load with a score or assessment dashboard
    await expect(page.locator('div:has-text("Design Score")').or(page.locator('div:has-text("Score")')).or(page.locator('div:has-text("Priority")')).first()).toBeVisible({ timeout: 8000 })

    // Toggle compliance tab
    const complianceTab = page.locator('button:has-text("Compliance Map")').or(page.locator('button:has-text("Compliance")')).or(page.locator('button:has-text("Standards Mapping")')).first()
    if (await complianceTab.isVisible()) {
      await complianceTab.click()
      await expect(page.locator('div:has-text("HIPAA")').or(page.locator('div:has-text("NIST")')).or(page.locator('div:has-text("Compliance")')).first()).toBeVisible()
    }

    // Toggle custom blueprint mode
    const customTab = page.locator('button:has-text("Paste Custom Design Code")').or(page.locator('button:has-text("Paste Custom")')).first()
    await expect(customTab).toBeVisible()
    await customTab.click()

    // Paste code block inside textarea
    const customTextarea = page.locator('textarea').first()
    await expect(customTextarea).toBeVisible()
    await customTextarea.fill('OAuth 2.1 implementation using PKCE, mTLS authorization server, and DPoP sender-constrained bearer tokens.')

    // Run custom analysis
    const analyzeCustomBtn = page.locator('button:has-text("Analyze Design Architecture")').first()
    await expect(analyzeCustomBtn).toBeVisible()
    await analyzeCustomBtn.click()

    // Verify Custom Report Dashboard renders
    await expect(page.locator('div:has-text("Custom User Upload Architecture Review")').or(page.locator('div:has-text("Design Score")')).or(page.locator('div:has-text("Score")')).first()).toBeVisible({ timeout: 5000 })
  })
})
