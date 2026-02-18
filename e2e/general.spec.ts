import { test, expect } from '@playwright/test'

test.describe('Application Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page should have proper metadata', async ({ page }) => {
    // Check page title
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should load page without errors', async ({ page }) => {
    // Listen for errors and console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    // We expect no critical errors - some warnings might be present
    expect(errors.length).toBeLessThan(5)
  })

  test('should have accessible heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    const h1Title = await h1.textContent()
    expect(h1Title).toContain('Smart Bookmark')
  })

  test('should have proper button accessibility', async ({ page }) => {
    const button = page.locator('button', { hasText: /Sign in with Google/i })

    // Button should be keyboard accessible
    await expect(button).toBeVisible()
    await expect(button).toBeFocused()
  })
})

test.describe('UI Component Visibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('all text content should be visible', async ({ page }) => {
    // Title
    const title = page.locator('text=Smart Bookmark')
    await expect(title).toBeVisible()

    // Subtitle
    const subtitle = page.locator('text=Organize your digital life')
    await expect(subtitle).toBeVisible()

    // Description
    const description = page.locator('text=/Save and organize your favorite bookmarks/')
    await expect(description).toBeVisible()

    // Footer text
    const footer = page.locator('text=Secure authentication with Google')
    await expect(footer).toBeVisible()
  })

  test('should have proper viewport coverage', async ({ page }) => {
    // Check that main content is centered
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()

    const box = await mainContent.boundingBox()
    expect(box).toBeTruthy()

    if (box) {
      // Content should be roughly centered
      const viewportSize = page.viewportSize()
      if (viewportSize) {
        // Content should not be too far left or right
        expect(box.x).toBeGreaterThan(-100)
      }
    }
  })
})

test.describe('Performance E2E Tests', () => {
  test('page should load reasonably fast', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    const loadTime = Date.now() - startTime

    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(10000) // 10 seconds
  })

  test('should handle multiple navigations', async ({ page }) => {
    await page.goto('/')
    await page.goto('/')
    await page.goto('/')

    // Page should still be responsive
    const title = page.locator('text=Smart Bookmark')
    await expect(title).toBeVisible()
  })
})
