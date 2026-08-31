import { test, expect } from '@playwright/test'

test.describe('Advanced Features: OAuth 2.1, OIDC Federation, and FIDO2 Conditional UI', () => {
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
      // ignore
    }
  })

  test('should run the OAuth 2.1 Transition Auditor successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/oauth-2-1-auditor')
    await expect(page.locator('h1').or(page.locator('h2')).or(page.locator('h3:has-text("Transition Auditor")')).first()).toBeVisible({ timeout: 5000 })

    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    
    // Fill with implicit flow request which is insecure in OAuth 2.1
    await textarea.fill('https://auth.company.com/authorize?response_type=token&client_id=123')
    
    const runBtn = page.locator('button:has-text("Run OAuth 2.1 Compliance Audit")')
    await expect(runBtn).toBeVisible()
    await runBtn.click()

    // It should flag Implicit flow as critical
    await expect(page.locator('div:has-text("Implicit flow")').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('span:has-text("Non-Compliant")').first()).toBeVisible()
  })

  test('should run OIDC Federation (Shared Trust Chains) lab successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/oidc-federation')
    
    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // ignore
    }

    await expect(page.locator('h1')).toContainText('OIDC Federation (Shared Trust Chains)')

    // Click Run Discovery on the first issuer
    const discoverBtn = page.locator('button:has-text("Run Discovery")').first()
    await expect(discoverBtn).toBeVisible()
    await discoverBtn.click()

    // Trace logs should populate
    await expect(page.locator('div.font-mono').first()).toContainText('Successfully discovered and cached public key', { timeout: 8000 })

    // Verify token after discovery has completed and cached keys are ready
    const verifyBtn = page.locator('button:has-text("Verify Token")').first()
    await verifyBtn.click()
    
    // We expect access granted via trust chain since the first issuer is trusted by default
    await expect(page.locator('div:has-text("ACCESS GRANTED VIA TRUST CHAIN")').first()).toBeVisible({ timeout: 5000 })
  })

  test('should simulate FIDO2 Conditional UI (Passkey Autofill)', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/fido2-conditional-ui')
    
    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // ignore
    }

    await expect(page.locator('h1')).toContainText('Passkey Conditional UI')

    // Click Enable Conditional UI
    const enableBtn = page.locator('button:has-text("Enable Conditional UI")')
    await expect(enableBtn).toBeVisible()
    await enableBtn.click()

    // Click on the mock autofill drop-down passkey
    const passkeyBtn = page.locator('button:has-text("alex@aboutiam.com")')
    await expect(passkeyBtn).toBeVisible()
    await passkeyBtn.click()

    // It should simulate authentication and show Authenticated!
    await expect(page.locator('h4:has-text("Authenticated!")')).toBeVisible({ timeout: 5000 })
  })
})
