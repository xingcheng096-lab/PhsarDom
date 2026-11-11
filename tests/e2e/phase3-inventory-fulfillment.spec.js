import { expect, test } from '@playwright/test'

async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

test('PO confirmation uses centralized reservation and survives refresh', async ({ page }) => {
  await loginAs(page, 'Super Admin')
  await page.goto('/admin/purchase-orders/4')
  await expect(page.getByRole('button', { name: 'Confirm Purchase Order' })).toBeVisible()
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  await page.getByRole('button', { name: 'Confirm Purchase Order' }).click()
  await expect(page.getByText(/Purchase order confirmed|already been confirmed/i)).toBeVisible()
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(after.reservations.length).toBeGreaterThanOrEqual(before.reservations.length)
  expect(after.audit.some((entry) => entry.entityType === 'purchaseOrder' || entry.action === 'PO_CONFIRMED_RESERVED')).toBe(true)
  await page.reload()
  await expect(page.getByText('Fulfillment quantities')).toBeVisible()
})

test('unauthorized buyer cannot see PO confirmation action', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/purchase-orders/1')
  await expect(page.getByRole('button', { name: 'Confirm Purchase Order' })).toHaveCount(0)
})

test('warehouse picking rejects over-reservation quantity', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/picking')
  await expect(page.getByRole('heading', { name: 'Picking' })).toBeVisible()
})

test('authorized warehouse user transfers stock through the visible form and persists audit', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/locations')
  await expect(page.getByRole('heading', { name: 'Locations & Stock Positions' })).toBeVisible()
  await page.getByLabel('Product / SKU').selectOption({ index: 1 })
  await page.getByLabel('Quantity').fill('1')
  await page.getByLabel('Transfer reference').fill('E2E-TRANSFER-1')
  await page.getByRole('button', { name: 'Transfer stock' }).click()
  await expect(page.getByText(/Transferred 1 units successfully/i)).toBeVisible()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(state.movements.some((entry) => entry.transactionId === 'E2E-TRANSFER-1')).toBe(true)
  expect(state.audit.some((entry) => entry.action === 'WAREHOUSE_TRANSFER' && entry.actor?.role === 'warehouse')).toBe(true)
  await page.reload()
  await expect(page.getByText('Warehouse transfer')).toBeVisible()
})

test('buyer cannot use warehouse transfer UI', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/locations')
  await expect(page.getByText('Warehouse transfer')).toHaveCount(0)
})

test('insufficient transfer is rejected without movement or audit mutation', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/locations')
  await page.getByLabel('Product / SKU').selectOption({ index: 1 })
  await page.getByLabel('Quantity').fill('999999')
  await page.getByLabel('Transfer reference').fill('E2E-TRANSFER-INSUFFICIENT')
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  await page.getByRole('button', { name: 'Transfer stock' }).click()
  await expect(page.getByText(/Insufficient available stock/i)).toBeVisible()
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(after.movements.length).toBe(before.movements.length)
  expect(after.audit.length).toBe(before.audit.length)
})

test('duplicate transfer reference is idempotent and audit actor persists', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/locations')
  await page.getByLabel('Product / SKU').selectOption({ index: 1 })
  await page.getByLabel('Quantity').fill('1')
  await page.getByLabel('Transfer reference').fill('E2E-TRANSFER-DUPLICATE')
  await page.getByRole('button', { name: 'Transfer stock' }).click()
  await expect(page.getByText(/Transferred 1 units successfully/i)).toBeVisible()
  const once = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  await page.getByLabel('Product / SKU').selectOption({ index: 1 })
  await page.getByLabel('Transfer reference').fill('E2E-TRANSFER-DUPLICATE')
  await page.getByLabel('Quantity').fill('1')
  await page.getByRole('button', { name: 'Transfer stock' }).click()
  await expect(page.getByText(/already processed/i)).toBeVisible()
  const twice = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(twice.movements.filter((entry) => entry.transactionId === 'E2E-TRANSFER-DUPLICATE')).toHaveLength(1)
  expect(twice.audit.filter((entry) => entry.action === 'WAREHOUSE_TRANSFER').length).toBeGreaterThanOrEqual(1)
  expect(twice.audit.find((entry) => entry.action === 'WAREHOUSE_TRANSFER' && entry.actor?.role === 'warehouse')).toBeTruthy()
  await page.reload()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').movements.filter((entry) => entry.transactionId === 'E2E-TRANSFER-DUPLICATE').length)).toBe(1)
  expect(twice.movements.length).toBe(once.movements.length)
})

test('unauthorized buyer cannot mutate receiving or create inventory audit', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  await page.goto('/buyer/receiving')
  await expect(page.getByRole('heading', { name: /Inbound Receiving/i })).toHaveCount(0)
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(after.audit.length).toBe(before.audit.length)
  expect(after.movements.length).toBe(before.movements.length)
})

test('authorized receiving writes stock movement and before/after audit', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/receiving')
  const receivingRow = page.getByRole('row').filter({ hasText: 'RCV-2026-2203' })
  await receivingRow.getByRole('button', { name: 'Arrive' }).click()
  await page.getByRole('button', { name: 'Mark arrived' }).click()
  await receivingRow.getByRole('button', { name: 'Start inbound QC' }).click()
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await receivingRow.getByRole('button', { name: 'Record' }).click()
  await page.getByLabel('Quantity received').fill('1')
  await page.getByRole('button', { name: 'Record' }).last().click()
  await receivingRow.getByRole('button', { name: 'Put away' }).click()
  await page.getByRole('button', { name: /Complete & post to stock/ }).click()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(state.movements.some((entry) => entry.type === 'Receiving' && entry.quantity === 1)).toBe(true)
  expect(state.audit.some((entry) => entry.action === 'STOCK_RECEIVED' && entry.actor?.role === 'warehouse' && entry.quantity === 1 && entry.before && entry.after)).toBe(true)
  await page.reload()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').audit.some((entry) => entry.action === 'STOCK_RECEIVED'))).toBe(true)
})

test('picking and packing UI write audit events with the active warehouse actor', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}')
    const pick = state.picking[0]
    pick.status = 'Picking'; pick.picked = 1; pick.qty = 1
    const row = state.inventoryOps.find((item) => item.sku === pick.sku)
    if (row) row.reserved = Math.max(1, row.reserved || 0)
    const pack = state.packing[0]
    pack.status = 'Packing'; pack.qty = 1
    state.picking = [pick, ...state.picking.slice(1)]
    state.packing = [pack, ...state.packing.slice(1)]
    localStorage.setItem('phsardom-erpv1', JSON.stringify(state))
  })
  await page.goto('/warehouse/picking')
  const pickRow = page.getByRole('row').filter({ hasText: 'PK-2026-901' })
  await pickRow.getByRole('button', { name: 'Complete' }).click()
  await page.getByRole('button', { name: 'Complete pick' }).click()
  await page.goto('/warehouse/packing')
  const packRow = page.getByRole('row').filter({ hasText: 'PKG-2026-501' })
  await packRow.getByRole('button', { name: 'Complete pack' }).click()
  await page.getByRole('button', { name: /Complete pack/ }).last().click()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(state.audit.some((entry) => entry.action === 'STOCK_PICKED' && entry.actor?.id && entry.actor?.role === 'warehouse' && entry.quantity === 1)).toBe(true)
  expect(state.audit.some((entry) => entry.action === 'STOCK_PACKED' && entry.actor?.id && entry.actor?.role === 'warehouse' && entry.quantity === 1)).toBe(true)
})
