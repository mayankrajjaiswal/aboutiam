import { test, expect } from '@playwright/test'

test.describe('AboutIAM Standards, References, and Research Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should navigate standards explorer tabs (Deadlines & mDL)', async ({ page }) => {
    await page.goto('http://localhost:5173/standards')
    await expect(page.locator('h2')).toContainText('Living Standards & RFC Explorer')

    // Click on "Compliance Deadlines" tab
    const deadlinesTab = page.locator('button:has-text("Compliance Deadlines")')
    await expect(deadlinesTab).toBeVisible()
    await deadlinesTab.click()

    // Deadlines list should render
    await expect(page.locator('h3').first()).toBeVisible()

    // Click on "Wallet/mDL Adoption" tab
    const walletTab = page.locator('button:has-text("Wallet/mDL Adoption")')
    await expect(walletTab).toBeVisible()
    await walletTab.click()

    // mDL table or cards should be visible
    await expect(page.locator('th:has-text("State")').or(page.locator('div:has-text("Adoption")')).first()).toBeVisible()
  })

  test('should inspect specific standards details and RFC deconstruction', async ({ page }) => {
    await page.goto('http://localhost:5173/standards')
    
    // Deconstruct the first standard (typically OAuth 2.0 / OIDC)
    const deconstructBtn = page.locator('button:has-text("Deconstruct RFC")').first()
    await expect(deconstructBtn).toBeVisible()
    await deconstructBtn.click()

    // Expect summary and flowchart tabs
    await expect(page.locator('button:has-text("SAML / Redirect Flow")').or(page.locator('button:has-text("Flowchart")')).or(page.locator('button:has-text("Vulnerabilities")')).first()).toBeVisible()
    
    // Click on "Vulnerabilities" detail tab
    const vulnTab = page.locator('button:has-text("Vulnerabilities")').first()
    if (await vulnTab.isVisible()) {
      await vulnTab.click()
      await expect(page.locator('h3:has-text("Known Threat Vectors")').or(page.locator('div:has-text("Vulnerability")')).first()).toBeVisible()
    }
  })

  test('should load Case Study Center and toggle difficulty filters', async ({ page }) => {
    await page.goto('http://localhost:5173/case-studies')
    await expect(page.locator('h2')).toContainText('Enterprise Case Study Center')

    // Click on "Financial Services" filter
    const financeFilter = page.locator('button:has-text("Financial Services")')
    if (await financeFilter.isVisible()) {
      await financeFilter.click()
      // Card counts should change
      await expect(page.locator('h3').first()).toBeVisible()
    }
  })

  test('should search reference implementations', async ({ page }) => {
    await page.goto('http://localhost:5173/references')
    await expect(page.locator('h2')).toContainText('Enterprise Reference Implementations')

    // Expect individual directories or snippets
    await expect(page.locator('div:has-text("Folder Structure")').first().or(page.locator('pre').first())).toBeVisible()
  })

  test('should filter CVE Research database', async ({ page }) => {
    await page.goto('http://localhost:5173/research')
    await expect(page.locator('h2')).toContainText('Research & CVE Tracker')

    // Filter by Advanced difficulty
    const advancedFilter = page.locator('button:has-text("Advanced")').first()
    if (await advancedFilter.isVisible()) {
      await advancedFilter.click()
      // Should show matching CVE files
      await expect(page.locator('h3:has-text("CVE-")').first()).toBeVisible()
    }
  })
})
