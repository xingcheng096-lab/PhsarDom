import { expect, test } from '@playwright/test'

async function loginBuyer(page, business) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  const selector = page.getByLabel(/Demo buyer account/)
  const value = await selector.locator('option').filter({ hasText: business }).getAttribute('value')
  await selector.selectOption(value)
  await page.getByRole('button', { name: 'Login as Verified Buyer' }).click()
}

async function loginRole(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

async function submitRfq(page) {
  await page.goto('/buyer/rfqs/new')
  await page.getByLabel('Product').selectOption({ label: 'Commercial Surface Cleaner 5L' })
  await page.getByLabel('Required quantity').fill('24')
  await page.getByLabel('Required delivery date').fill('2099-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
}

test('pending buyer is blocked from RFQ submission', async ({ page }) => {
  await loginBuyer(page, 'Greenline Retail Partners')
  await page.goto('/buyer/rfqs/new')
  await page.getByLabel('Product').selectOption({ label: 'Commercial Surface Cleaner 5L' })
  await page.getByLabel('Required quantity').fill('24')
  await page.getByLabel('Required delivery date').fill('2099-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await expect(page.getByText(/approved buyer/i)).toBeVisible()
  await expect(page).toHaveURL(/\/buyer\/rfqs\/new/)
})

test('quantity below MOQ is rejected by the visible RFQ form', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/rfqs/new')
  await page.getByLabel('Product').selectOption({ label: 'Commercial Surface Cleaner 5L' })
  await page.getByLabel('Required quantity').fill('1')
  await page.getByLabel('Required delivery date').fill('2099-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await expect(page.getByText('Minimum order quantity is')).toBeVisible()
  await expect(page).toHaveURL(/\/buyer\/rfqs\/new/)
})

test('buyer ownership blocks another buyer quotation URL', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/quotations/2')
  await expect(page.getByText('Access denied')).toBeVisible()
})

test('rejected buyer is denied RFQ creation without persistence', async ({ page }) => {
  await loginRole(page, 'Super Admin')
  await page.goto('/admin/buyers/3')
  await page.getByRole('button', { name: 'Reject' }).click()
  await page.getByLabel('Rejection reason').fill('KYC document could not be verified.')
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.getByText(/rejected/i).first()).toBeVisible()
  await loginBuyer(page, 'Greenline Retail Partners')
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]').length)
  await submitRfq(page)
  await expect(page.getByText(/approved buyer/i)).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]').length)).toBe(before)
})

test('suspended buyer is denied RFQ creation without persistence', async ({ page }) => {
  await loginRole(page, 'Super Admin')
  await page.goto('/admin/buyers/1')
  await page.getByRole('button', { name: 'Suspend' }).click()
  await page.getByRole('button', { name: 'Suspend', exact: true }).last().click()
  await expect(page.getByText(/suspended/i).first()).toBeVisible()
  await loginBuyer(page, 'Atlas Hospitality Group')
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]').length)
  await submitRfq(page)
  await expect(page.getByText(/approved buyer/i)).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]').length)).toBe(before)
})

test('buyer cannot accept another buyer quotation', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/buyer/quotations/2')
  await expect(page.getByText('Access denied')).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]').some((row) => row.quote === 'QT-2026-0831'))).toBe(false)
})

test('unauthorized buyer cannot approve quotation', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.goto('/manager/quotations/1')
  await expect(page.getByText(/Role-Based Access Control|Access denied/i).first()).toBeVisible()
})

test('expired quotation cannot be accepted and creates no PO', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.evaluate(() => {
    const quotes = JSON.parse(localStorage.getItem('meridian-demo-quotations') || '[]')
    const quote = quotes.find((row) => row.id === 1) || { id: 1, number: 'QT-2026-0832', buyer: 'Atlas Hospitality Group', buyerId: 1, rfq: 'RFQ-2026-1048', product: 'Commercial Surface Cleaner 5L', quantity: 24, unitPrice: 80, terms: 'Net-30', status: 'Sent' }
    quote.status = 'Sent'; quote.expiry = '2000-01-01'
    localStorage.setItem('meridian-demo-quotations', JSON.stringify([...quotes.filter((row) => row.id !== 1), quote]))
  })
  await page.goto('/buyer/quotations/1')
  await page.getByRole('button', { name: 'Accept Quote' }).click()
  await page.getByRole('button', { name: 'Accept Quote', exact: true }).last().click()
  await expect(page.getByText(/expired|not sent|awaiting approval/i)).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]').filter((row) => row.quote === 'QT-2026-0832').length)).toBe(0)
})

test('duplicate quote conversion remains idempotent after refresh', async ({ page }) => {
  await loginBuyer(page, 'Atlas Hospitality Group')
  await page.evaluate(() => {
    const quotes = JSON.parse(localStorage.getItem('meridian-demo-quotations') || '[]')
    const quote = quotes.find((row) => row.id === 1) || { id: 1, number: 'QT-2026-0832', buyer: 'Atlas Hospitality Group', buyerId: 1, rfq: 'RFQ-2026-1048', product: 'Commercial Surface Cleaner 5L', quantity: 24, unitPrice: 80, terms: 'Net-30', status: 'Sent' }
    quote.status = 'Sent'; quote.expiry = '2099-12-31'; localStorage.setItem('meridian-demo-quotations', JSON.stringify([...quotes.filter((row) => row.id !== 1), quote]))
    localStorage.setItem('meridian-demo-purchaseOrders', JSON.stringify([]))
  })
  await page.goto('/buyer/quotations/1')
  await page.getByRole('button', { name: 'Accept Quote' }).click()
  await page.getByRole('button', { name: 'Accept Quote', exact: true }).last().click()
  await expect(page.getByText(/Purchase order .* created/i)).toBeVisible()
  await page.reload()
  const count = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]').filter((row) => row.quote === 'QT-2026-0832').length)
  expect(count).toBe(1)
})
