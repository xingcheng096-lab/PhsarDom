import { expect, test } from '@playwright/test'

async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

for (const viewport of [{ name: '1440 desktop', width: 1440, height: 900 }, { name: '1024 tablet', width: 1024, height: 900 }, { name: '768 transition', width: 768, height: 900 }, { name: '390 mobile', width: 390, height: 844 }, { name: '320 narrow', width: 320, height: 700 }]) {
  test(`responsive report and commission pages fit ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await loginAs(page, 'Super Admin')
    for (const route of ['/admin/dashboard', '/admin/reports/sales']) {
      await page.goto(route)
      await expect(page.locator('body')).toContainText(route.includes('reports') ? 'Sales Report' : 'Dashboard')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await loginAs(page, 'Finance / Credit Officer')
    await page.goto('/finance/commissions')
    await expect(page.locator('body')).toContainText('Commission Management')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('reports and commission controls have keyboard-accessible labels and focus', async ({ page }) => {
  await loginAs(page, 'Super Admin')
  await page.goto('/admin/reports/sales')
  await expect(page.getByLabel('Reporting period')).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/commissions')
  await expect(page.getByLabel('Rate (%)')).toBeVisible()
  await page.getByLabel('Rate (%)').focus()
  await expect(page.getByLabel('Rate (%)')).toBeFocused()
})
