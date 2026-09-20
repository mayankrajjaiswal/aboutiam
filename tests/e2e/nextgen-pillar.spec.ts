import { test, expect } from '@playwright/test'

test.describe('Next-Gen IAM Pillar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and bypass disclaimer/tour/whats-new overlays before each test
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.09.19' } }))
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

  test('Next-Gen IAM sidebar group navigates to the pillar hub', async ({ page }) => {
    const sidebarNav = page.locator('nav')
    await sidebarNav.getByRole('button', { name: 'Next-Gen IAM' }).click()
    await sidebarNav.getByRole('link', { name: 'Next-Gen IAM Center' }).click()
    await expect(page).toHaveURL(/\/next-gen$/)
    await expect(page.locator('h1:has-text("The Next Generation of Identity")')).toBeVisible()
  })

  test('Home page Next-Gen strip links into the Agentic Identity hub', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.getByRole('link', { name: /Agentic Identity & Governance/i }).click()
    await expect(page).toHaveURL(/\/next-gen\/agentic-identity$/)
    await expect(page.locator('h1:has-text("Agentic Identity Center")')).toBeVisible()
  })

  test('Agentic Identity Center switches tabs and shows the agent job-description schema', async ({ page }) => {
    await page.goto('http://localhost:5173/next-gen/agentic-identity')
    await expect(page.locator('h1:has-text("Agentic Identity Center")')).toBeVisible()

    await page.locator('button:has-text("Job Description")').click()
    await expect(page.locator('h2:has-text("An Agent Needs a Job Description")')).toBeVisible()
  })

  test('should audit a sample agent record in the Agent Registry & Lifecycle Studio', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/agent-registry')
    await expect(page.locator('h1:has-text("Agent Registry & Lifecycle Studio")')).toBeVisible()

    const agentButton = page.locator('button').filter({ hasText: /Sub-Agent|Orchestrator|Agent/ }).first()
    await expect(agentButton).toBeVisible()
    await agentButton.click()

    await expect(page.locator('text=Governance Posture')).toBeVisible()
  })

  test('should tune the AI Guardrail Policy Studio and see a confusion matrix', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/ai-guardrails')
    await expect(page.locator('h1:has-text("AI Guardrail Policy Studio")')).toBeVisible()

    await page.locator('button:has-text("Run Evaluation")').click()
    await expect(page.getByRole('heading', { name: 'Semantic Guardrail' })).toBeVisible()
  })

  test('should run a round of the FIDO Fleet Operations Simulator', async ({ page }) => {
    await page.goto('http://localhost:5173/playground/fido-fleet-ops')
    await expect(page.locator('h1:has-text("FIDO Fleet Operations Simulator")')).toBeVisible()
  })

  test('should complete the Agent Governance Readiness Assessor and see a maturity score', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/agent-governance-readiness')
    await expect(page.locator('h2').first()).toContainText('Agent Governance Readiness Assessor')

    // Answer the first visible readiness question at its lowest maturity level to progress the assessment.
    const firstOption = page.locator('button', { hasText: 'Not started' }).first()
    await expect(firstOption).toBeVisible()
    await firstOption.click()

    await expect(page.locator('text=/\\d+ \\/ 26 answered/')).toBeVisible()
  })

  test('should adjust an input on the Passwordless ROI Calculator and see the illustrative-assumption notice', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/passwordless-roi-calculator')
    await expect(page.locator('h2').first()).toContainText('Passwordless ROI & Helpdesk Cost Calculator')
    await expect(page.locator('text=This is a planning model, not a vendor performance claim.')).toBeVisible()
  })

  test('IAM Academy Track 7 "Next-Generation Identity" is reachable and expandable', async ({ page }) => {
    await page.goto('http://localhost:5173/learn')
    const track7 = page.locator('button', { hasText: '7. Next-Generation Identity' }).first()
    await expect(track7).toBeVisible()
    await track7.click()
    await expect(page.locator('text=Why Agents Change Identity')).toBeVisible()
  })
})
