import { expect, test } from '@playwright/test'


async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.goto('/login')
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

test('buyer ownership blocks a direct quotation URL', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/quotations/2')
  await expect(page.getByText('Access denied')).toBeVisible()
})

test('approved buyer can submit an RFQ through the visible form', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-session') || 'null'))
  expect(session).toMatchObject({ key: 'buyer', buyerId: 1, buyerBusiness: 'Atlas Hospitality Group', buyerStatus: 'Approved' })
  await page.goto('/buyer/rfqs/new')
  await page.getByLabel('Product').selectOption({ label: 'Commercial Surface Cleaner 5L' })
  await page.getByLabel('Required quantity').fill('24')
  await page.getByLabel('Required delivery date').fill('2099-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await expect(page).toHaveURL(/\/buyer\/rfqs$/)
  const created = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]').find((item) => item.buyerId === 1))
  expect(created).toMatchObject({ buyerId: 1, buyer: 'Atlas Hospitality Group', product: 'Commercial Surface Cleaner 5L', quantity: 24 })
  await page.reload()
  await expect(page).toHaveURL(/\/buyer\/rfqs$/)
  await expect(page.getByText(created.number)).toBeVisible()
})
