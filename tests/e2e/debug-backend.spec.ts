import { test, expect } from '@playwright/test'

test('debug backend notification', async ({ page }) => {
  // Capture network requests
  const requests: any[] = []

  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('action') || url.includes('notifications')) {
      try {
        const body = await response.text()
        requests.push({ url, status: response.status(), body: body.substring(0, 500) })
      } catch {
        requests.push({ url, status: response.status() })
      }
    }
  })

  await page.goto('/admin/demos/notifications')
  await page.waitForSelector('h1:has-text("Notifications Demo")', { timeout: 10000 })

  // Wait for Vue to mount
  await page.waitForTimeout(1000)

  // Click the Success Notification button (server-side)
  const button = page.locator('button:has-text("Success Notification")')
  await button.click()

  // Wait for response
  await page.waitForTimeout(3000)

  // Log requests
  console.log('Network requests:', JSON.stringify(requests, null, 2))

  // Check page.props.notifications
  const pageProps = await page.evaluate(() => {
    // Get Inertia page props
    const inertiaPage = (window as any).__page || (window as any).__inertia_page
    return {
      hasInertia: !!(inertiaPage),
      notifications: inertiaPage?.props?.notifications,
      allPropKeys: Object.keys(inertiaPage?.props || {})
    }
  })

  console.log('Page props:', JSON.stringify(pageProps, null, 2))

  // Check notification store
  const storeState = await page.evaluate(() => {
    return {
      hasStore: typeof (window as any).__laravilt_notifications__ !== 'undefined',
      notifications: (window as any).__laravilt_notifications__ || []
    }
  })

  console.log('Store state:', JSON.stringify(storeState, null, 2))

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-backend.png' })
})
