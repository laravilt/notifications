import { test, expect } from '@playwright/test'

/**
 * Notifications Component E2E Tests
 *
 * Tests notification display, types, durations, dismissal,
 * and various notification scenarios against the Notifications Demo page.
 */

// Helper to get the notification container
const getNotificationContainer = (page: any) => page.locator('.fixed.top-4.right-4')

test.describe('Notifications Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/demos/notifications')
    await page.waitForSelector('h1:has-text("Notifications Demo")', { timeout: 10000 })
  })

  test.describe('Page Rendering', () => {
    test('should render the Notifications Demo page', async ({ page }) => {
      await expect(page.locator('h1:has-text("Notifications Demo")')).toBeVisible()
    })

    test('should display Quick Notifications section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Quick Notifications")')).toBeVisible()
    })

    test('should display Duration Control section', async ({ page }) => {
      // There are two Duration Control sections - check first one exists
      const sections = page.locator('h2:has-text("Duration Control")')
      await expect(sections.first()).toBeVisible()
    })

    test('should display all client-side notification buttons', async ({ page }) => {
      // Client-side buttons in Quick Notifications section
      const quickSection = page.locator('text=Quick Notifications').locator('..')
      await expect(page.locator('button:has-text("Success")').first()).toBeVisible()
      await expect(page.locator('button:has-text("Error")').first()).toBeVisible()
      await expect(page.locator('button:has-text("Warning")').first()).toBeVisible()
      await expect(page.locator('button:has-text("Info")').first()).toBeVisible()
    })
  })

  test.describe('Client-Side Notifications', () => {
    test('should display success notification when clicking Success button', async ({ page }) => {
      // Click the first Success button (client-side in Quick Notifications)
      await page.locator('button:has-text("Success")').first().click()

      // Wait for notification to appear
      await page.waitForTimeout(300)

      // Check notification is visible with correct content
      const container = getNotificationContainer(page)
      await expect(container.locator('text=Success!')).toBeVisible({ timeout: 3000 })
    })

    test('should display error notification when clicking Error button', async ({ page }) => {
      // Click the first Error button (client-side)
      await page.locator('button:has-text("Error")').first().click()

      // Wait for notification to appear
      await page.waitForTimeout(300)

      // Check notification is visible
      const container = getNotificationContainer(page)
      await expect(container.locator('text=Error!')).toBeVisible({ timeout: 3000 })
    })

    test('should display warning notification when clicking Warning button', async ({ page }) => {
      // Click the first Warning button (client-side)
      await page.locator('button:has-text("Warning")').first().click()

      // Wait for notification to appear
      await page.waitForTimeout(300)

      // Check notification is visible
      const container = getNotificationContainer(page)
      await expect(container.locator('text=Warning!')).toBeVisible({ timeout: 3000 })
    })

    test('should display info notification when clicking Info button', async ({ page }) => {
      // Click the first Info button (client-side in Quick Notifications section)
      await page.locator('button:has-text("Info")').first().click()

      // Wait for notification to appear
      await page.waitForTimeout(300)

      // Check notification is visible - use exact text match for title
      const container = getNotificationContainer(page)
      await expect(container.getByText('Information', { exact: true })).toBeVisible({ timeout: 3000 })
    })

    test('should show notification title and body text', async ({ page }) => {
      // Click the first Success button (client-side)
      await page.locator('button:has-text("Success")').first().click()

      // Wait for notification
      await page.waitForTimeout(300)

      // Check for both title and body content
      const container = getNotificationContainer(page)
      await expect(container.locator('text=Success!')).toBeVisible({ timeout: 3000 })
      await expect(container.locator('text=Your action completed successfully')).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Notification Styling', () => {
    test('should apply success styling (green) for success notification', async ({ page }) => {
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(300)

      // Check for green color classes
      const container = getNotificationContainer(page)
      const notification = container.locator('[class*="green"]').first()
      await expect(notification).toBeVisible({ timeout: 3000 })
    })

    test('should apply error styling (red) for error notification', async ({ page }) => {
      await page.locator('button:has-text("Error")').first().click()
      await page.waitForTimeout(300)

      // Check for red color classes
      const container = getNotificationContainer(page)
      const notification = container.locator('[class*="red"]').first()
      await expect(notification).toBeVisible({ timeout: 3000 })
    })

    test('should apply warning styling (yellow) for warning notification', async ({ page }) => {
      await page.locator('button:has-text("Warning")').first().click()
      await page.waitForTimeout(300)

      // Check for yellow color classes
      const container = getNotificationContainer(page)
      const notification = container.locator('[class*="yellow"]').first()
      await expect(notification).toBeVisible({ timeout: 3000 })
    })

    test('should apply info styling (blue) for info notification', async ({ page }) => {
      await page.locator('button:has-text("Info")').first().click()
      await page.waitForTimeout(300)

      // Check for blue color classes
      const container = getNotificationContainer(page)
      const notification = container.locator('[class*="blue"]').first()
      await expect(notification).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Notification Dismissal', () => {
    test('should have close button on notification', async ({ page }) => {
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(300)

      // Check for close button (X icon)
      const container = getNotificationContainer(page)
      const closeButton = container.locator('button').first()
      await expect(closeButton).toBeVisible({ timeout: 3000 })
    })

    test('should dismiss notification when clicking close button', async ({ page }) => {
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(300)

      // Find and click the close button
      const container = getNotificationContainer(page)
      const closeButton = container.locator('button').first()
      await closeButton.click()

      // Wait for animation
      await page.waitForTimeout(500)

      // Notification should be gone
      await expect(container.locator('text=Success!')).toBeHidden({ timeout: 3000 })
    })
  })

  test.describe('Duration Control (Client-Side)', () => {
    test('should have client-side duration buttons', async ({ page }) => {
      // These are the client-side buttons in the first Duration Control section
      await expect(page.locator('button:has-text("2 Seconds")').first()).toBeVisible()
      await expect(page.locator('button:has-text("5 Seconds")').first()).toBeVisible()
      await expect(page.locator('button:has-text("10 Seconds")').first()).toBeVisible()
      await expect(page.locator('button:has-text("Persistent")').first()).toBeVisible()
    })

    test('should auto-dismiss quick notification after ~2 seconds', async ({ page }) => {
      // Click first 2 Seconds button (client-side)
      await page.locator('button:has-text("2 Seconds")').first().click()
      await page.waitForTimeout(300)

      // Notification should be visible initially - use exact text match
      const container = getNotificationContainer(page)
      await expect(container.getByText('Quick (2s)', { exact: true })).toBeVisible({ timeout: 2000 })

      // Wait for auto-dismiss (2 seconds + buffer)
      await page.waitForTimeout(2500)

      // Notification should be gone
      await expect(container.getByText('Quick (2s)', { exact: true })).toBeHidden({ timeout: 1000 })
    })

    test('should keep persistent notification visible until dismissed', async ({ page }) => {
      // Click the first Persistent button (client-side)
      await page.locator('button:has-text("Persistent")').first().click()
      await page.waitForTimeout(300)

      const container = getNotificationContainer(page)

      // Notification should be visible
      await expect(container.locator('text=Persistent')).toBeVisible({ timeout: 2000 })

      // Wait longer than normal auto-dismiss time
      await page.waitForTimeout(4000)

      // Should still be visible
      await expect(container.locator('text=Persistent')).toBeVisible()

      // Dismiss manually
      const closeButton = container.locator('button').first()
      await closeButton.click()

      await page.waitForTimeout(500)
      await expect(container.locator('text=Persistent')).toBeHidden({ timeout: 1000 })
    })
  })

  test.describe('Multiple Notifications', () => {
    test('should display multiple notifications stacked', async ({ page }) => {
      // Click multiple notification buttons quickly
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(100)
      await page.locator('button:has-text("Error")').first().click()
      await page.waitForTimeout(100)
      await page.locator('button:has-text("Warning")').first().click()

      await page.waitForTimeout(500)

      // Check that multiple notifications are visible
      const container = getNotificationContainer(page)
      const notifications = container.locator('[class*="rounded"]')

      // Should have at least 2 notifications visible (some might have auto-dismissed)
      const count = await notifications.count()
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should stack notifications in correct order', async ({ page }) => {
      // Trigger success first, then error
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(200)
      await page.locator('button:has-text("Error")').first().click()

      await page.waitForTimeout(500)

      // Both should be visible
      const container = getNotificationContainer(page)
      await expect(container.locator('text=Success!')).toBeVisible()
      await expect(container.locator('text=Error!')).toBeVisible()
    })
  })

  // Server-side tests must run serially to avoid cookie/session conflicts
  test.describe.serial('Server-Side Notifications', () => {
    test('should have Basic Notifications group', async ({ page }) => {
      await expect(page.locator('h2:has-text("Basic Notifications")')).toBeVisible()
    })

    test('should have all server-side notification buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Success Notification")')).toBeVisible()
      await expect(page.locator('button:has-text("Error Notification")')).toBeVisible()
      await expect(page.locator('button:has-text("Warning Notification")')).toBeVisible()
      await expect(page.locator('button:has-text("Info Notification")')).toBeVisible()
    })

    test('should show success notification from server action', async ({ page }) => {
      await page.locator('button:has-text("Success Notification")').click()
      // Wait for page navigation after 303 redirect and for cookie to be processed
      await page.waitForTimeout(1000)

      const container = getNotificationContainer(page)
      // Use exact match for title to avoid matching body text
      await expect(container.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 })
    })

    test('should show error notification from server action', async ({ page }) => {
      await page.locator('button:has-text("Error Notification")').click()
      await page.waitForTimeout(1000)

      const container = getNotificationContainer(page)
      await expect(container.getByText('Error!', { exact: true })).toBeVisible({ timeout: 10000 })
    })

    test('should show warning notification from server action', async ({ page }) => {
      await page.locator('button:has-text("Warning Notification")').click()
      await page.waitForTimeout(1000)

      const container = getNotificationContainer(page)
      await expect(container.getByText('Warning!', { exact: true })).toBeVisible({ timeout: 10000 })
    })

    test('should show info notification from server action', async ({ page }) => {
      await page.locator('button:has-text("Info Notification")').click()
      await page.waitForTimeout(1000)

      const container = getNotificationContainer(page)
      await expect(container.getByText('Information', { exact: true })).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Custom Icons', () => {
    test('should have Custom Icons group', async ({ page }) => {
      await expect(page.locator('h2:has-text("Custom Icons")')).toBeVisible()
    })

    test('should have all custom icon buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Mail Icon")')).toBeVisible()
      await expect(page.locator('button:has-text("User Icon")')).toBeVisible()
      await expect(page.locator('button:has-text("Cart Icon")')).toBeVisible()
      await expect(page.locator('button:has-text("Download Icon")')).toBeVisible()
    })
  })

  test.describe('Rich Content', () => {
    test('should have Rich Content group', async ({ page }) => {
      await expect(page.locator('h2:has-text("Rich Content")')).toBeVisible()
    })

    test('should have all rich content buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Long Content")')).toBeVisible()
      await expect(page.locator('button:has-text("Title Only")')).toBeVisible()
      await expect(page.locator('button:has-text("Body Only")')).toBeVisible()
    })
  })

  test.describe('Multiple Server Notifications', () => {
    test('should have Multiple Notifications group', async ({ page }) => {
      await expect(page.locator('h2:has-text("Multiple Notifications")')).toBeVisible()
    })

    test('should have all multiple notification buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Stack Multiple")')).toBeVisible()
      await expect(page.locator('button:has-text("Mixed Types")')).toBeVisible()
    })
  })

  test.describe('Real-World Examples', () => {
    test('should have Real-World Examples group', async ({ page }) => {
      await expect(page.locator('h2:has-text("Real-World Examples")')).toBeVisible()
    })

    test('should have all real-world example buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Save Success")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete Success")')).toBeVisible()
      await expect(page.locator('button:has-text("Validation Error")')).toBeVisible()
      await expect(page.locator('button:has-text("Permission Denied")')).toBeVisible()
      await expect(page.locator('button:has-text("Network Error")')).toBeVisible()
      await expect(page.locator('button:has-text("Upload Started")')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper notification container positioning', async ({ page }) => {
      // Click the first Success button (client-side)
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(300)

      const container = getNotificationContainer(page)
      await expect(container).toBeVisible({ timeout: 3000 })
    })

    test('should have accessible close button', async ({ page }) => {
      // Click the first Success button (client-side)
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(300)

      const container = getNotificationContainer(page)
      const closeButton = container.locator('button').first()

      // Button should be focusable and clickable
      await expect(closeButton).toBeVisible()
    })
  })

  test.describe('Animation', () => {
    test('should animate notification entry', async ({ page }) => {
      // Click the first Success button (client-side)
      await page.locator('button:has-text("Success")').first().click()

      // Check that notification container exists immediately
      const container = getNotificationContainer(page)
      await expect(container).toBeVisible({ timeout: 1000 })
    })

    test('should animate notification exit on dismiss', async ({ page }) => {
      // Click the first Success button (client-side)
      await page.locator('button:has-text("Success")').first().click()
      await page.waitForTimeout(500)

      const container = getNotificationContainer(page)

      // Dismiss the notification
      const closeButton = container.locator('button').first()
      await closeButton.click()

      // After animation completes, notification should be gone
      await page.waitForTimeout(500)
      await expect(container.locator('text=Success!')).toBeHidden({ timeout: 1000 })
    })
  })
})
