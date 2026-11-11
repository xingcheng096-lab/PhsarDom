import { expect, test } from '@playwright/test'

test('public home and products routes render on desktop and mobile', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PhsarDom/i)
  await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible()

  await page.goto('/products')
  await expect(page).toHaveURL(/\/products$/)
  await expect(page.getByRole('heading', { name: /Everything your business needs/i })).toBeVisible()
  await expect(page.getByLabel('Search products')).toBeVisible()
})

test('unknown routes return the application shell', async ({ page }) => {
  const response = await page.goto('/does-not-exist', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)
})

test('public product cards link to valid details and preserve Buy Now intent for guests', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('link', { name: 'Buy Now' }).first().click()
  await expect(page).toHaveURL(/\/login\?from=%2Fbuyer%2Fpurchase-review/)
  const from = new URL(page.url()).searchParams.get('from')
  expect(from).toMatch(/\/buyer\/purchase-review\?productId=\d+&quantity=\d+/)
  await page.getByLabel(/business email/i).fill('maya@atlashospitality.com')
  await page.getByLabel('Password').fill('demo-password')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/buyer\/purchase-review\?productId=\d+&quantity=\d+/)
})

test('public backordered product explains why Buy Now is unavailable', async ({ page }) => {
  await page.goto('/products/6')
  await expect(page.getByRole('heading', { name: '18V Cordless Drill Kit' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText(/Backordered|unavailable/i)
  await expect(page.getByText('Buy Now unavailable')).toBeVisible()
})

test('legacy product detail route redirects safely to the canonical catalog', async ({ page }) => {
  await page.goto('/products/detail')
  await expect(page).toHaveURL(/\/products$/)
})
