import { test, expect } from '@playwright/test'

test.describe('Login Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page elements', async ({ page }) => {
    // Check for main title
    await expect(page.locator('h1')).toContainText('Smart Bookmark')

    // Check for subtitle
    await expect(page.locator('text=Organize your digital life')).toBeVisible()

    // Check for description
    await expect(
      page.locator('text=Save and organize your favorite bookmarks')
    ).toBeVisible()

    // Check for sign in button
    const signInButton = page.locator('button', { hasText: /Sign in with Google/i })
    await expect(signInButton).toBeVisible()
  })

  test('should have proper styling on login page', async ({ page }) => {
    // Check for gradient background
    const mainDiv = page.locator('div').first()
    const bgClass = await mainDiv.getAttribute('class')
    expect(bgClass).toContain('bg-gradient-to-br')

    // Check for card styling
    const card = page.locator('[class*="rounded-3xl"]')
    await expect(card).toBeVisible()
  })

  test('should display the branded logo area', async ({ page }) => {
    // Check for the icon area with gradient background
    const logoArea = page.locator('[class*="bg-gradient-to-br"][class*="from-teal"]')
    await expect(logoArea).toBeVisible()
  })

  test('should have proper font hierarchy', async ({ page }) => {
    const title = page.locator('h1')
    const titleClass = await title.getAttribute('class')
    expect(titleClass).toContain('text-4xl')
    expect(titleClass).toContain('font-bold')
  })

  test('should have animation classes', async ({ page }) => {
    // Check for fade-in animations
    const animatedElements = page.locator('[class*="animate-fadeIn"]')
    const count = await animatedElements.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should support dark mode styling classes', async ({ page }) => {
    // Check for dark mode classes
    const elements = page.locator('[class*="dark:"]')
    const count = await elements.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have responsive design', async ({ page }) => {
    // Check for responsive classes like sm:, lg:
    const classAttribute = await page.locator('body').getAttribute('class')
    // The page should have responsive utility classes applied

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=Smart Bookmark')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('text=Smart Bookmark')).toBeVisible()
  })
})

test.describe('Sign In Button Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have interactive sign in button', async ({ page }) => {
    const signInButton = page.locator('button', { hasText: /Sign in with Google/i })
    await expect(signInButton).toBeVisible()
    await expect(signInButton).toBeEnabled()
  })

  test('should display sign in button with Google icon', async ({ page }) => {
    const signInButton = page.locator('button', { hasText: /Sign in with Google/i })

    // Check for SVG (Google icon)
    const svg = signInButton.locator('svg')
    await expect(svg).toBeVisible()

    // Check for button text
    const text = signInButton.locator('text=Sign in with Google')
    await expect(text).toBeVisible()
  })

  test('should have proper button styling', async ({ page }) => {
    const signInButton = page.locator('button', { hasText: /Sign in with Google/i })
    const classAttribute = await signInButton.getAttribute('class')

    // Should have gradient background
    expect(classAttribute).toContain('bg-gradient-to-r')
    expect(classAttribute).toContain('from-teal')

    // Should have proper sizing
    expect(classAttribute).toContain('px-6')
    expect(classAttribute).toContain('py-3')

    // Should have rounded corners
    expect(classAttribute).toContain('rounded')
  })

  test('should hover effect on sign in button', async ({ page }) => {
    const signInButton = page.locator('button', { hasText: /Sign in with Google/i })

    // Check that hover classes are applied
    const classAttribute = await signInButton.getAttribute('class')
    expect(classAttribute).toContain('hover:')
  })
})
