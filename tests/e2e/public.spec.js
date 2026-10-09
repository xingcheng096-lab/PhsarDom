import { expect, test } from '@playwright/test'

test('public home and products routes render on desktop and mobile', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PhsarDom/i)
  await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible()

  await page.goto('/products')
  await expect(page).toHaveURL(/\/products$/)
  await expect(page.getByRole('heading', { name: 'Wholesale Product Catalog' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Refine results' })).toBeVisible()
})

test('unknown routes return the application shell', async ({ page }) => {
  const response = await page.goto('/does-not-exist', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)
})
