import { expect, test } from '@playwright/test'

async function loginBuyer(page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Login as Verified Buyer' }).click()
}

test('buyer catalog provides searchable cards and responsive filters', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/products')
  await expect(page.getByRole('heading', { name: 'Buyer Catalog' })).toBeVisible()
  await expect(page.getByText('Industrial USB-C Docking Station')).toBeVisible()
  await page.getByLabel('Search products').fill('docking')
  await expect(page.getByText('Industrial USB-C Docking Station')).toBeVisible()
  await expect(page.getByText('ANSI Safety Vest - Class 2')).not.toBeVisible()
})

test('buyer product detail calculates tier pricing and carries product into RFQ', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/products/1')
  await expect(page.getByRole('heading', { name: 'Industrial USB-C Docking Station' })).toBeVisible()
  await page.getByLabel('Quantity').fill('100')
  await expect(page.getByText('$8,200.00')).toBeVisible()
  await page.getByRole('link', { name: 'Add to RFQ' }).click()
  await expect(page).toHaveURL(/\/buyer\/rfqs\/new\?productId=1&quantity=100/)
  await expect(page.getByLabel('Product')).toHaveValue('Industrial USB-C Docking Station')
  await expect(page.getByLabel('Required quantity')).toHaveValue('100')
})

test('buyer Buy Now opens review before creating a purchase order', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/products/1')
  await page.getByLabel('Quantity').fill('50')
  await page.getByRole('link', { name: 'Buy Now' }).click()
  await expect(page).toHaveURL(/\/buyer\/purchase-review\?productId=1&quantity=50&purchaseKey=/)
  await expect(page.getByRole('heading', { name: 'Review your order' })).toBeVisible()
  await expect(page.getByText('Confirm Purchase Order')).toBeVisible()
  await expect(page.getByText('$4,475.00').first()).toBeVisible()
  await expect(page.getByText('PO-DIRECT')).toHaveCount(0)
})

test('buyer confirms a direct purchase order and duplicate confirmation is idempotent', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/products/1')
  await page.getByLabel('Quantity').fill('50')
  await page.getByRole('link', { name: 'Buy Now' }).click()
  const reviewUrl = page.url()
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page).toHaveURL(/\/buyer\/purchase-orders\/DPO-/)
  const createdUrl = page.url()
  await page.goto(reviewUrl)
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page).toHaveURL(createdUrl)
  const directOrders = await page.evaluate(() => {
    const erp = JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}')
    return (erp.purchaseOrders || []).filter((order) => order.source === 'DIRECT_PURCHASE')
  })
  expect(directOrders).toHaveLength(1)
  await page.reload()
  await page.goto('/buyer/purchase-orders')
  await expect(page.getByText(directOrders[0].number)).toBeVisible()
})

test('buyer catalog blocks below-MOQ quantity before RFQ navigation', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/rfqs/new?productId=1&quantity=1')
  await page.getByLabel('Required delivery date').fill('2026-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await expect(page.getByText(/MOQ|minimum/i).first()).toBeVisible()
  await expect(page).toHaveURL(/\/buyer\/rfqs\/new/)
})

test('buyer catalog filter toolbar remains sticky across responsive viewports', async ({ page }) => {
  await loginBuyer(page)
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 800 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/buyer/products')
    await expect(page.getByRole('heading', { name: 'Buyer Catalog' })).toBeVisible()
    const toolbar = page.getByTestId('buyer-catalog-toolbar')
    await expect(toolbar).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 700))
    await expect(toolbar).toBeVisible()
    const position = await toolbar.evaluate((element) => ({ top: element.getBoundingClientRect().top, position: getComputedStyle(element).position }))
    expect(position.position).toBe('sticky')
    expect(position.top).toBeGreaterThanOrEqual(60)
    expect(position.top).toBeLessThanOrEqual(68)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
})

test('buyer purchasing views show owned quotations and purchase orders', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/quotations')
  await expect(page.getByRole('heading', { name: 'My Quotations' })).toBeVisible()
  await page.goto('/buyer/purchase-orders')
  await expect(page.getByRole('heading', { name: 'My Purchase Orders' })).toBeVisible()
})

test('buyer shipment and invoice views expose persisted status summaries', async ({ page }) => {
  await loginBuyer(page)
  await page.goto('/buyer/shipments')
  await expect(page.getByRole('heading', { name: 'Shipment Tracking' })).toBeVisible()
  await page.goto('/buyer/invoices')
  await expect(page.getByRole('heading', { name: 'Invoices & Payment Status' })).toBeVisible()
})
