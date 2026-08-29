import { test, expect } from '@playwright/test'

test.describe('AboutIAM Incident Playbooks, Checklists, and Vendor Intel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should load Security Bulletins and run the data-driven Crisis Response Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/bulletins')
    await expect(page.locator('h1')).toContainText('Identity Security Bulletin Board')

    // Click on the first incident bulletin selector
    const firstBulletin = page.locator('button:has-text("SolarWinds")').first().or(page.locator('button[class*="text-left"]').first())
    await expect(firstBulletin).toBeVisible()
    await firstBulletin.click()

    // Assert simulator container is present
    await expect(page.locator('span:has-text("Crisis Simulator")')).toBeVisible()

    // Click Step 1: Detect Threat
    const step1Btn = page.locator('button:has-text("Step 1: Detect Threat")')
    await expect(step1Btn).toBeVisible()
    await step1Btn.click()

    // Assert that log console updates
    await expect(page.locator('span:has-text("Audit")').or(page.locator('span.font-mono')).or(page.locator('span:has-text("Detect")')).first()).toBeVisible({ timeout: 5000 })

    // Click Step 2: Analyze Vector
    const step2Btn = page.locator('button:has-text("Step 2: Analyze Vector")')
    await expect(step2Btn).toBeVisible()
    await step2Btn.click()

    // Click Remediate (High) - the correct containment action
    const remediateHighBtn = page.locator('button:has-text("Remediate (High)")')
    await expect(remediateHighBtn).toBeVisible()
    await remediateHighBtn.click()

    // Check for success output
    await expect(page.locator('span:has-text("Incident Contained")').or(page.locator('span:has-text("Successful")')).first()).toBeVisible({ timeout: 5000 })
  })

  test('should load developer cheat-sheets checklists and update progress', async ({ page }) => {
    await page.goto('http://localhost:5173/cheat-sheets')
    await expect(page.locator('h2')).toContainText('Developer Hardening Playbooks')

    // Click on a checkbox in the active checklist
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    if (await firstCheckbox.isVisible()) {
      const isCheckedBefore = await firstCheckbox.isChecked()
      await firstCheckbox.click()
      const isCheckedAfter = await firstCheckbox.isChecked()
      expect(isCheckedBefore).not.toBe(isCheckedAfter)

      // The progress gauge or completeness percentage should update or be visible
      await expect(page.locator('div:has-text("%")').first()).toBeVisible()
    }
  })

  test('should load Vendor Knowledge Center and toggle Compare Mode', async ({ page }) => {
    await page.goto('http://localhost:5173/vendor')
    await expect(page.locator('h1')).toContainText('Enterprise Ecosystem & Vendor Intelligence')

    // Enter Compare Mode
    const compareBtn = page.locator('button:has-text("Compare")').first()
    await expect(compareBtn).toBeVisible()
    await compareBtn.click()

    // Expect "Compare (0/3)" status or list format with checkboxes to load
    await expect(page.locator('span:has-text("Compare (")').first()).toBeVisible()

    // Select the first platform to compare (e.g. keycloak, okta, microsoft-entra)
    const firstPlatform = page.locator('button:has-text("Microsoft Entra")').first().or(page.locator('button[class*="text-left"]').first())
    await expect(firstPlatform).toBeVisible()
    await firstPlatform.click()

    // Select the second platform to compare (e.g. okta)
    const secondPlatform = page.locator('button:has-text("Okta")').first().or(page.locator('button[class*="text-left"]').nth(1))
    await expect(secondPlatform).toBeVisible()
    await secondPlatform.click()

    // Compare side-by-side table should now be rendered since at least 2 are selected
    await expect(page.locator('th:has-text("Attribute")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('td:has-text("Licensing Model")')).toBeVisible()
  })
})
