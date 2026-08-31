import { test, expect } from '@playwright/test'

test.describe('AboutIAM Interactive Playgrounds & Labs', () => {
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

  test('should navigate to playgrounds catalog and list simulators', async ({ page }) => {
    await page.goto('http://localhost:5173/playground')
    await expect(page).toHaveTitle(/IAM Playgrounds — Free Interactive Security Simulators | AboutIAM/)
    
    // Expect lists or grids of simulators
    const catalogGrid = page.locator('div.grid')
    await expect(catalogGrid).toBeVisible()
    await expect(page.locator('h4:has-text("Session Hijacking & Token Theft Lab")')).toBeVisible()
  })

  test('should run the DPoP Sender-Constrained Tokens laboratory workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/dpop')
    await expect(page.locator('h1')).toContainText('DPoP (Proof-of-Possession) Sandbox')

    // Click on Generate DPoP Keypair
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // ignore
    }
    const generateBtn = page.locator('button:has-text("Generate DPoP Keypair")')
    await expect(generateBtn).toBeVisible()
    await generateBtn.click()

    // Keypair generation outputs a public/private key preview
    await expect(page.locator('span:has-text("Public JWK")').first()).toBeVisible({ timeout: 5000 })

    // Simulate Valid Request bound with the active DPoP key
    const validBtn = page.locator('button:has-text("Send Valid DPoP Request")')
    await expect(validBtn).toBeVisible()
    await validBtn.click()

    // Expect trace output or status success
    await expect(page.locator('div.terminal-high-contrast').first()).toContainText('200 OK', { timeout: 5000 })

    // Simulate Replay Attack (sending the replayed token without a matching key signature)
    const replayBtn = page.locator('button:has-text("Simulate Token Replay Attack")')
    await expect(replayBtn).toBeVisible()
    await replayBtn.click()

    // Expect the replayed request to fail at the Gateway
    await expect(page.locator('div.terminal-high-contrast').first()).toContainText('ACCESS DENIED', { timeout: 5000 })
  })

  test('should run the Build-Your-Own-IdP OIDC Provider wizard', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/build-your-idp')
    await expect(page.locator('h1')).toContainText('Build-Your-Own-IdP Sandbox')

    // Step 1: Generate RS256 Keypair
    const generateKeysBtn = page.locator('button:has-text("Generate RS256 Keypair")')
    await expect(generateKeysBtn).toBeVisible()
    await generateKeysBtn.click()

    // Expect public key PEM to be displayed
    await expect(page.locator('pre:has-text("BEGIN PUBLIC KEY")')).toBeVisible({ timeout: 5000 })

    // Step 2: Go to client configuration
    const clientStepBtn = page.locator('button:has-text("2. Client Config")')
    if (await clientStepBtn.isVisible()) {
      await clientStepBtn.click()
    }

    // Step 5 / Run the full mock auth code flow + PKCE
    const runBtn = page.locator('button:has-text("Run Authorization Code + PKCE Flow")')
    if (await runBtn.isVisible()) {
      await runBtn.click()
      
      // Wait for success indicator or terminal output of token minting
      await expect(page.locator('div:has-text("MINTED")').or(page.locator('div:has-text("SUCCESS")')).or(page.locator('div:has-text("ID Token")'))).toBeVisible({ timeout: 8000 })
    }
  })

  test('should successfully generate and verify a Zero-Knowledge Age Proof', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/zkp-wallet')
    await expect(page.locator('h2')).toContainText('Zero-Knowledge Proof')

    // Step 1: Click Generate ZKP
    const dismissBtnZkp = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtnZkp).toBeVisible({ timeout: 1000 })
      await dismissBtnZkp.click()
    } catch {
      // ignore
    }
    const genZkpBtn = page.locator('button:has-text("Generate ZKP")')
    await expect(genZkpBtn).toBeVisible()
    await genZkpBtn.click()

    // Step 2: Verify Payload
    const verifyBtn = page.locator('button:has-text("Verify Payload")')
    await expect(verifyBtn).toBeVisible({ timeout: 5000 })
    await verifyBtn.click()

    // Expect proof verified check
    await expect(page.locator('h5:has-text("ACCESS GRANTED")').or(page.locator('div:has-text("ACCESS GRANTED")')).first()).toBeVisible({ timeout: 5000 })
  })
})
