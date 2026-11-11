import { expect, test } from '@playwright/test'

async function loginBuyer(page, business) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  const selector = page.getByLabel(/Demo buyer account/)
  const value = await selector.locator('option').filter({ hasText: business }).getAttribute('value')
  await selector.selectOption(value)
  await page.getByRole('button', { name: 'Login as Verified Buyer' }).click()
}

test('pending buyer cannot confirm a direct purchase', async ({ page }) => {
  await loginBuyer(page, 'Greenline Retail Partners')
  await page.goto('/buyer/purchase-review?productId=1&quantity=50&purchaseKey=pending-direct')
  await expect(page.getByRole('heading', { name: 'Review your order' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page.getByText(/approved buyer/i)).toBeVisible()
  await expect(page).toHaveURL(/purchase-review/)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').purchaseOrders?.some((row) => row.idempotencyKey === 'pending-direct'))).toBeFalsy()
})

test('below-MOQ direct purchase remains blocked before confirmation', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/purchase-review?productId=1&quantity=1&purchaseKey=below-moq-direct')
  await expect(page.getByText(/minimum order quantity|MOQ/i).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm Purchase Order' })).toHaveCount(0)
})

test('out-of-stock direct purchase is rejected without creating a PO', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/products/6')
  await expect(page.getByRole('alert')).toContainText(/stock/i)
  await expect(page.getByRole('link', { name: 'Buy Now' })).toHaveAttribute('aria-disabled', 'true')
  await expect(page).toHaveURL(/\/buyer\/products\/6$/)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').purchaseOrders?.some((row) => row.productId === 6))).toBeFalsy()
})

test('direct purchase confirmation remains idempotent after a second browser submission', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/purchase-review?productId=1&quantity=50&purchaseKey=repeat-direct')
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page).toHaveURL(/\/buyer\/purchase-orders\/DPO-/)
  const firstUrl = page.url()
  await page.goto('/buyer/purchase-review?productId=1&quantity=50&purchaseKey=repeat-direct')
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page).toHaveURL(firstUrl)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').purchaseOrders.filter((row) => row.idempotencyKey === 'repeat-direct'))).toHaveLength(1)
})
