import { test, expect } from '@playwright/test'

test.describe('AboutIAM Interactive Playgrounds & Labs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should navigate to playgrounds catalog and list simulators', async ({ page }) => {
    await page.goto('http://localhost:5173/playground')
    await expect(page).toHaveTitle(/IAM Playgrounds — Free Interactive Security Simulators | AboutIAM/)
    
    // Expect lists or grids of simulators
    const catalogGrid = page.locator('div.grid')
    await expect(catalogGrid).toBeVisible()
    await expect(page.locator('h3:has-text("DPoP (Proof-of-Possession) Sandbox")')).toBeVisible()
  })

  test('should run the DPoP Sender-Constrained Tokens laboratory workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/dpop')
    await expect(page.locator('h2')).toContainText('DPoP (Proof-of-Possession) Sandbox')

    // Click on Generate DPoP Keypair
    const generateBtn = page.locator('button:has-text("Generate DPoP Keypair")')
    await expect(generateBtn).toBeVisible()
    await generateBtn.click()

    // Keypair generation outputs a public/private key preview
    await expect(page.locator('div:has-text("DPoP Keypair Active")').first()).toBeVisible({ timeout: 5000 })

    // Simulate Valid Request bound with the active DPoP key
    const validBtn = page.locator('button:has-text("Simulate Request")')
    await expect(validBtn).toBeVisible()
    await validBtn.click()

    // Expect trace output or status success
    await expect(page.locator('div:has-text("200 OK")').or(page.locator('div:has-text("SUCCESS")')).or(page.locator('div:has-text("Valid")'))).toBeVisible({ timeout: 5000 })

    // Simulate Replay Attack (sending the replayed token without a matching key signature)
    const replayBtn = page.locator('button:has-text("Simulate Replay Attack")')
    await expect(replayBtn).toBeVisible()
    await replayBtn.click()

    // Expect the replayed request to fail at the Gateway
    await expect(page.locator('div:has-text("401 Unauthorized")').or(page.locator('div:has-text("REJECTED")')).or(page.locator('div:has-text("Blocked")')).or(page.locator('div:has-text("Invalid Signature")'))).toBeVisible({ timeout: 5000 })
  })

  test('should run the Build-Your-Own-IdP OIDC Provider wizard', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/build-your-idp')
    await expect(page.locator('h2')).toContainText('Build-Your-Own-IdP Sandbox')

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
    const genZkpBtn = page.locator('button:has-text("Generate ZKP")')
    await expect(genZkpBtn).toBeVisible()
    await genZkpBtn.click()

    // Expect cryptographic variables or proof status
    await expect(page.locator('div:has-text("Proof Generated")').or(page.locator('div:has-text("ZKP Proof")'))).toBeVisible({ timeout: 5000 })

    // Step 2: Verify Payload
    const verifyBtn = page.locator('button:has-text("Verify Payload")')
    await expect(verifyBtn).toBeVisible()
    await verifyBtn.click()

    // Expect proof verified check
    await expect(page.locator('div:has-text("Proof Verified")').or(page.locator('div:has-text("SUCCESS")')).or(page.locator('span:has-text("Verified")'))).toBeVisible({ timeout: 5000 })
  })
})
