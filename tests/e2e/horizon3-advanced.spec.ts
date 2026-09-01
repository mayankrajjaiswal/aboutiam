import { test, expect } from '@playwright/test'

test.describe('Advanced Horizon 3 Next-Gen Playgrounds', () => {
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

  // 1. OPA Wasm Playground
  test('should run OPA Wasm Playground Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/opa-wasm')
    await expect(page.locator('h2:has-text("Wasm-Native OPA & Directory Engine Simulator")')).toBeVisible()

    const evaluateBtn = page.locator('button:has-text("Compile to Wasm")')
    await expect(evaluateBtn).toBeVisible()
    await evaluateBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('allow = true')
  })

  // 2. MCP Server Sandbox
  test('should run MCP Server Playground', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/mcp-server')
    await expect(page.locator('h2:has-text("Model Context Protocol (MCP) Server Sandbox")')).toBeVisible()

    const executeBtn = page.locator('button:has-text("Execute MCP Tool Protocol Handshake")')
    await expect(executeBtn).toBeVisible()
    await executeBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('get_encyclopedia_term')
  })

  // 3. WebRTC P2P Handshake
  test('should run WebRTC P2P Playground', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/webrtc-p2p')
    await expect(page.locator('h2:has-text("WebRTC P2P Cryptographic Handshake")')).toBeVisible()

    const handshakeBtn = page.locator('button:has-text("Negotiate P2P WebRTC Handshake")')
    await expect(handshakeBtn).toBeVisible()
    await handshakeBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('SDP Offer', { timeout: 5000 })
  })

  // 4. War Room Threat Simulator
  test('should run SOC War Room Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/war-room')
    await expect(page.locator('h2:has-text("War Room")')).toBeVisible()

    const rotateBtn = page.locator('button:has-text("Rotate Cloud Credentials")')
    await expect(rotateBtn).toBeVisible()
    await rotateBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('rotated')
  })

  // 5. Biometric Mesh Lab
  test('should run Biometric Mesh Playground', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/biometric-mesh')
    await expect(page.locator('h2:has-text("Computer-Vision Biometric Mesh Lab")')).toBeVisible()

    const blinkBtn = page.locator('button:has-text("Simulate Blink Reflex")')
    await expect(blinkBtn).toBeVisible()
    await blinkBtn.click()

    await expect(page.locator('div.font-mono')).toContainText('blink reflex')
  })
})
