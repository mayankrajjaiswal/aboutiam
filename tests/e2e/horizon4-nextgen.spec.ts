import { test, expect } from '@playwright/test'

test.describe('Horizon 4 Next-Gen Playgrounds', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and bypass disclaimer overlays before each test
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.07.28' } }))
    })
    await page.reload()
    
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // already dismissed
    }
  })

  // 1. MPC Threshold Signature Scheme
  test('should run MPC Threshold Signature Sandbox', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/mpc-threshold')
    await expect(page.locator('h2:has-text("MPC Threshold Signature Scheme Sandbox")')).toBeVisible()

    const deviceBtn = page.locator('button:has-text("2 devices")')
    await expect(deviceBtn).toBeVisible()
    await deviceBtn.click()

    const signBtn = page.locator('button:has-text("Generate Threshold Signature")')
    await expect(signBtn).toBeVisible()
    await signBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Lagrange polynomial interpolation')
  })

  // 2. ZK Cross-Chain Auth
  test('should run ZK Cross-Chain Auth Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/zk-cross-chain')
    await expect(page.locator('h2:has-text("ZK Cross-Chain Auth Simulator")')).toBeVisible()

    const proveBtn = page.locator('button:has-text("Generate & Verify zk-SNARK")')
    await expect(proveBtn).toBeVisible()
    await proveBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('zk-SNARK cryptographic circuit')
  })

  // 3. Sybil-Resistant Iris Hash Lab
  test('should run Sybil-Resistant Iris Hash Lab', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/sybil-orb')
    await expect(page.locator('h2:has-text("Sybil-Resistant Iris Hash Lab")')).toBeVisible()

    const scanBtn = page.locator('button:has-text("Scan Iris")')
    await expect(scanBtn).toBeVisible()
    await scanBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Gabor filter vectors')
  })

  // 4. M2M AI Protocol Negotiator
  test('should run M2M AI Protocol Negotiator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/m2m-negotiator')
    await expect(page.locator('h2:has-text("M2M AI Protocol Negotiator")')).toBeVisible()

    const negotiateBtn = page.locator('button:has-text("Start M2M Negotiation")')
    await expect(negotiateBtn).toBeVisible()
    await negotiateBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Client Agent requesting scope', { timeout: 5000 })
  })

  // 5. Kinetic-Tremor Continuous Trust
  test('should run Kinetic-Tremor Continuous Trust Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/ocular-kinetic')
    await expect(page.locator('h2:has-text("Kinetic-Tremor Continuous Trust Simulator")')).toBeVisible()

    const stableBtn = page.locator('button:has-text("Stable Baseline")')
    await expect(stableBtn).toBeVisible()
    await stableBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('saccades')
  })
})
