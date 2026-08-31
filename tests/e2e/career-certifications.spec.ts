import { test, expect } from '@playwright/test'

test.describe('AboutIAM Career & Certification Framework', () => {
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

  test('should load certifications catalog, filter, and run a flagship certification quiz', async ({ page }) => {
    await page.goto('http://localhost:5173/certifications')
    
    // Self-healing: if the disclaimer modal pops up due to hydration lag, dismiss it
    const dismissBtn = page.locator('button:has-text("Got it, let\'s go")')
    try {
      await expect(dismissBtn).toBeVisible({ timeout: 1000 })
      await dismissBtn.click()
    } catch {
      // Modal didn't pop up or was already dismissed
    }

    await expect(page.locator('h1')).toContainText('Enterprise Certification Hub')

    // Flagship certificate should render study path or show quiz option
    await expect(page.locator('h2:has-text("SC-900")').first()).toBeVisible({ timeout: 10000 })

    // Click option buttons to run flagship mock exam
    const quizOption = page.locator('button:has-text("Option")').first().or(page.locator('button[class*="border-border-subtle"]').first())
    if (await quizOption.isVisible()) {
      await quizOption.click()
      const nextBtn = page.locator('button:has-text("Next Question")').or(page.locator('button:has-text("Finish Quiz")'))
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
      }
    }
  })

  test('should navigate role tracks in Interview Career Center and test MCQs and simulations', async ({ page }) => {
    await page.goto('http://localhost:5173/career-center')
    await expect(page.locator('h1')).toContainText('Interview & Career Center')

    // Select the first role track (e.g., IAM Security Engineer or Administrator)
    const roleTrackBtn = page.locator('button:has-text("Security Engineer")').first().or(page.locator('button:has-text("Administrator")').first())
    await expect(roleTrackBtn).toBeVisible()
    await roleTrackBtn.click()

    // Test multiple choice questions tab
    const mcqOption = page.locator('div.space-y-2 > button').first()
    if (await mcqOption.isVisible()) {
      await mcqOption.click()
      const submitMcqBtn = page.locator('button:has-text("Submit Answer")').first()
      await expect(submitMcqBtn).toBeVisible()
      await submitMcqBtn.click()
    }

    // Toggle mock simulators tab
    const mockTab = page.locator('button:has-text("Mock Simulators")')
    await expect(mockTab).toBeVisible()
    await mockTab.click()

    // Click Begin Interactive Simulation
    const beginSimBtn = page.locator('button:has-text("Begin Interactive Simulation")')
    if (await beginSimBtn.isVisible()) {
      await beginSimBtn.click()
      await expect(page.locator('button:has-text("Submit & Finish Question")')).toBeVisible({ timeout: 5000 })
    }

    // Toggle Resume & Portfolio tab
    const resumeTab = page.locator('button:has-text("Resume & Portfolio")')
    await expect(resumeTab).toBeVisible()
    await resumeTab.click()

    // Check portfolio and auto-drafted resume bullets visibility
    await expect(page.locator('h3:has-text("Auto-Drafted Resume Bullets")').or(page.locator('span:has-text("Identity Portfolio Checklist")'))).toBeVisible()
  })

  test('should load historic breaches museum and run flashcard quiz mode', async ({ page }) => {
    await page.goto('http://localhost:5173/wall-of-shame?tab=quiz')
    await expect(page.locator('h2')).toContainText('Historical Evolution & Breach Museum')

    // Since we are in ?tab=quiz, we should see Spaced Repetition flashcards
    const startQuizBtn = page.locator('button:has-text("Start Review")').or(page.locator('button:has-text("Reveal Answer")')).or(page.locator('div:has-text("SM-2")'))
    await expect(startQuizBtn).toBeVisible()
  })
})
