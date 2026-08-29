import { test, expect } from '@playwright/test'

test.describe('AboutIAM Career & Certification Framework', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should load certifications catalog, filter, and run a flagship certification quiz', async ({ page }) => {
    await page.goto('http://localhost:5173/certifications')
    await expect(page.locator('h2')).toContainText('Enterprise Certification Hub')

    // Click on Microsoft SC-300 flagship certification (or the first available button that has a quiz)
    const flagshipBtn = page.locator('button:has-text("Identity and Access Administrator")').first().or(page.locator('button:has-text("Okta Certified")').first())
    await expect(flagshipBtn).toBeVisible()
    await flagshipBtn.click()

    // Flagship certificate should render study path or show quiz option
    await expect(page.locator('h3:has-text("Microsoft Certified:")').or(page.locator('h3:has-text("Study Path & Blueprint")')).first()).toBeVisible({ timeout: 5000 })

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
    await expect(page.locator('h1')).toContainText('Interview Prep & Career Center')

    // Select the first role track (e.g., IAM Security Engineer or Administrator)
    const roleTrackBtn = page.locator('button:has-text("Security Engineer")').first().or(page.locator('button:has-text("Administrator")').first())
    await expect(roleTrackBtn).toBeVisible()
    await roleTrackBtn.click()

    // Test multiple choice questions tab
    const mcqOption = page.locator('button[class*="border"]').first()
    if (await mcqOption.isVisible()) {
      await mcqOption.click()
      const submitMcqBtn = page.locator('button:has-text("Submit Answer")')
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
    await expect(page.locator('h2')).toContainText('Vulnerability & Breach Museum')

    // Since we are in ?tab=quiz, we should see Spaced Repetition flashcards
    const startQuizBtn = page.locator('button:has-text("Start Quiz")').or(page.locator('button:has-text("Reveal Answer")')).or(page.locator('div:has-text("SM-2")'))
    await expect(startQuizBtn).toBeVisible()
  })
})
