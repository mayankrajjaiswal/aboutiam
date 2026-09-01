import { test, expect } from '@playwright/test'

test.describe('Horizon 3 Next-Gen Playgrounds and Tools', () => {
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

  // 1. RAG-Aware Authorization
  test('should run RAG-Aware Authorization Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/rag-authorization')
    await expect(page.locator('h2:has-text("RAG-Aware Authorization Policy Engine")')).toBeVisible()

    const triggerBtn = page.locator('button:has-text("CEO salary")').first()
    await expect(triggerBtn).toBeVisible()
    await triggerBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('CEO Salary')
  })

  // 2. Ephemeral AI Swarm
  test('should run AI Swarm Orchestrator Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/ai-swarm')
    await expect(page.locator('h2:has-text("Ephemeral AI Swarm Identity Orchestrator")')).toBeVisible()

    const spawnBtn = page.locator('button:has-text("Spawn Constrained Swarm")')
    await expect(spawnBtn).toBeVisible()
    await spawnBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Child Swarm active')
  })

  // 3. Fully Homomorphic Encryption (FHE)
  test('should run FHE Auth Sandbox', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/fhe-auth')
    await expect(page.locator('h2:has-text("Fully Homomorphic Encryption")')).toBeVisible()

    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill('secretPoly123')

    const computeBtn = page.locator('button:has-text("Compute FHE Intersection")')
    await expect(computeBtn).toBeVisible()
    await computeBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('polynomial intersection confirmed')
  })

  // 4. Quantum Key Distribution (QKD)
  test('should run QKD Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/qkd-simulator')
    await expect(page.locator('h2:has-text("Quantum Key Distribution")')).toBeVisible()

    const qkdBtn = page.locator('button:has-text("Start QKD Handshake")')
    await expect(qkdBtn).toBeVisible()
    await qkdBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('cryptographic key established')
  })

  // 5. mDL Proximity
  test('should run mDL Proximity Lab', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/mdl-proximity')
    await expect(page.locator('h2:has-text("mDL Proximity Authentication Lab")')).toBeVisible()

    const tapBtn = page.locator('button:has-text("Tap mDL Phone")')
    await expect(tapBtn).toBeVisible()
    await tapBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('age-attestation without full PII')
  })

  // 6. Space Identity & DTN
  test('should run Space Identity DTN Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/space-identity')
    await expect(page.locator('h2:has-text("Space Identity & DTN Simulator")')).toBeVisible()

    const txBtn = page.locator('button:has-text("Transmit Space Bundle")')
    await expect(txBtn).toBeVisible()
    await txBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Lunar Relay Gateway', { timeout: 5000 })
  })

  // 7. V2X PKI
  test('should run V2X PKI Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/v2x-pki')
    await expect(page.locator('h2:has-text("V2X PKI Expressway Simulator")')).toBeVisible()

    const verifyBtn = page.locator('button:has-text("Verify Compliant Vehicle")')
    await expect(verifyBtn).toBeVisible()
    await verifyBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('verified leaf signature')
  })

  // 8. eBPF Identity Tracer
  test('should run eBPF Kernel Identity Tracer', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/ebpf-tracer')
    await expect(page.locator('h2:has-text("eBPF Kernel-Level Identity Tracer")')).toBeVisible()

    const executeBtn = page.locator('button:has-text("Execute Signed Binary")')
    await expect(executeBtn).toBeVisible()
    await executeBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('probe intercepting sys_enter_connect')
  })

  // 9. Digital Twin Binding
  test('should run Digital Twin Binding Workbench', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/digital-twin')
    await expect(page.locator('h2:has-text("Digital Twin Identity Binding Workbench")')).toBeVisible()

    const bindBtn = page.locator('button:has-text("Bind PUF")')
    await expect(bindBtn).toBeVisible()
    await bindBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('Physical Unclonable Function')
  })

  // 10. BCI Neural Auth
  test('should run BCI Neural Auth Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/bci-auth')
    await expect(page.locator('h2:has-text("BCI Neural Auth Baseline Simulator")')).toBeVisible()

    const scanBtn = page.locator('button:has-text("Calibrated Baseline")')
    await expect(scanBtn).toBeVisible()
    await scanBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('P300 polynomial spikes')
  })

  // 11. C2PA Provenance Tool
  test('should run C2PA Provenance Tool', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/c2pa-provenance')
    await expect(page.locator('h1')).toContainText('C2PA Cryptographic Provenance Tool')

    const simulateBtn = page.locator('button:has-text("Hardware-Signed")')
    await expect(simulateBtn).toBeVisible()
    await simulateBtn.click()

    await expect(page.locator('p:has-text("Leica Camera AG")')).toBeVisible()
  })

  // 12. EU AI Act Assessor Tool
  test('should run EU AI Act Compliance Assessor Tool', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/eu-ai-act-assessor')
    await expect(page.locator('h1')).toContainText('EU AI Act Identity Compliance Assessor')

    const highRiskCheckbox = page.locator('input[type="checkbox"]').first()
    await expect(highRiskCheckbox).toBeVisible()
    await highRiskCheckbox.check()

    await expect(page.locator('h3:has-text("Automated Logging Active")')).toBeVisible()
  })

  // 13. OIDC / SAML Trace Log Anonymizer
  test('should run Log Anonymizer Tool', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/log-anonymizer')
    await expect(page.locator('h1')).toContainText('OIDC / SAML Trace Log Anonymizer')

    const loadBtn = page.locator('button:has-text("Load Sample Log")')
    await expect(loadBtn).toBeVisible()
    await loadBtn.click()

    const redactBtn = page.locator('button:has-text("Scrub and Redact Log")')
    await expect(redactBtn).toBeVisible()
    await redactBtn.click()

    await expect(page.locator('pre')).toContainText('[REDACTED_CLIENT_SECRET]')
  })
})
