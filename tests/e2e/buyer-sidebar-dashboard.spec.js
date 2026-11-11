import { expect, test } from '@playwright/test'

async function loginBuyer(page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Login as Verified Buyer' }).click()
}

test('buyer sidebar shows session business, verification and purchasing navigation', async ({ page }) => {
  await loginBuyer(page)
  await expect(page.getByText('Buyer Account')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Primary navigation' }).getByText('Atlas Hospitality Group')).toBeVisible()
  await expect(page.getByText('Verified · Active')).toBeVisible()
  await expect(page.getByRole('link', { name: 'My RFQs' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'My Quotations' })).toBeVisible()
})

test('buyer dashboard uses live account context and working quick actions', async ({ page }) => {
  await loginBuyer(page)
  await expect(page.getByRole('heading', { name: 'Buyer Dashboard' })).toBeVisible()
  await expect(page.getByRole('main').getByTitle('Atlas Hospitality Group')).toBeVisible()
  await expect(page.getByRole('button', { name: /Browse catalog/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /New RFQ/i }).first()).toBeVisible()
  await page.getByRole('button', { name: /Browse catalog/i }).first().click()
  await expect(page).toHaveURL(/\/buyer\/products$/)
})

test('buyer catalog child navigation expands and highlights active route', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/products')
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Products' })).toHaveClass(/text-cyan-300/)
})

test('buyer sidebar collapses and expands with accessible control', async ({ page }) => {
  await loginBuyer(page)
  const collapse = page.getByTitle('Collapse sidebar')
  await collapse.click()
  await expect(page.getByTitle('Expand sidebar')).toBeVisible()
  await page.getByTitle('Expand sidebar').click()
  await expect(page.getByTitle('Collapse sidebar')).toBeVisible()
})

test('buyer mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await loginBuyer(page)
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(page.getByRole('complementary', { name: 'Primary navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('complementary', { name: 'Primary navigation' })).toHaveClass(/-translate-x-full/)
})

test('buyer layout stays within viewport at compact mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await loginBuyer(page)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
