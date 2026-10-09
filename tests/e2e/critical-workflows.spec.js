import { expect, test } from '@playwright/test'

async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.goto('/login')
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

test('buyer can log in, create an RFQ, and persist it locally', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await expect(page).toHaveURL(/\/buyer\/dashboard$/)
  await page.goto('/buyer/rfqs/new')
  await page.getByLabel('Product').selectOption({ label: 'Commercial Surface Cleaner 5L' })
  await page.getByLabel('Required quantity').fill('24')
  await page.getByLabel('Required delivery date').fill('2026-10-01')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await expect(page).toHaveURL(/\/buyer\/rfqs$/)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-rfqs') || '[]'))
  expect(stored.some((row) => row.product === 'Commercial Surface Cleaner 5L' && row.quantity === 24)).toBe(true)
})

test('buyer product detail exposes MOQ and tier pricing', async ({ page }) => {
  await page.goto('/products/1')
  await expect(page.getByText('Minimum order')).toBeVisible()
  await expect(page.getByText('Quantity tier')).toBeVisible()
  await page.getByLabel('Order quantity').fill('100')
  await expect(page.getByText('$82.00')).toBeVisible()
})

test('buyer quotation can be accepted and persisted as accepted', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/quotations/1')
  await page.getByRole('button', { name: 'Accept & Convert to PO' }).click()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-quotations') || '[]'))
  expect(stored.some((row) => row.id === 1 && row.status === 'Accepted')).toBe(true)
  const purchaseOrders = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]'))
  const created = purchaseOrders.find((row) => row.quote === 'QT-2026-0832')
  expect(created).toMatchObject({ buyer: 'Atlas Hospitality Group', ordered: 240, terms: 'Net-60', status: 'Pending' })
  expect(created.amount).toBe(39120)
  await page.goto(`/buyer/purchase-orders/${created.id}`)
  await expect(page.getByRole('heading', { name: created.number })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept & Convert to PO' })).toHaveCount(0)
  const poCountBeforeRefresh = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]').filter((row) => row.quote === 'QT-2026-0832').length)
  await page.reload()
  await expect(page.getByRole('heading', { name: created.number })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-purchaseOrders') || '[]').filter((row) => row.quote === 'QT-2026-0832').length)).toBe(poCountBeforeRefresh)
})

test('buyer counter-offer is added to the quotation negotiation history', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/quotations/1')
  await page.getByRole('button', { name: 'Counter Offer' }).click()
  await page.getByLabel('Proposed unit price (USD)').fill('160.50')
  await page.getByLabel('Quantity').fill('48')
  await page.getByLabel('Payment terms').selectOption({ label: 'Net-60' })
  await page.getByLabel('Comments').fill('Please confirm the revised volume price.')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText(/Counter offer submitted/i)).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-quotations') || '[]'))
  const quotation = stored.find((row) => row.id === 1)
  expect(quotation.negotiations.at(-1)).toMatchObject({ status: 'Countered', price: 160.5, quantity: 48, terms: 'Net-60' })
})

test('buyer can open the purchase-order payment schedule and see net terms', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/purchase-orders/2')
  await page.getByRole('button', { name: 'Payments' }).click()
  await expect(page.getByText('Payment Schedule')).toBeVisible()
  await expect(page.getByText('Net-60')).toBeVisible()
  await expect(page.getByText('40% Before Shipment')).toBeVisible()
})

test('buyer cannot access admin dashboard and can sign out', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/admin/dashboard')
  await expect(page.getByText('Role-Based Access Control')).toBeVisible()
  await page.goto('/buyer/dashboard')
  await page.getByRole('button', { name: /open maya chen account menu/i }).click()
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/)
  expect(await page.evaluate(() => localStorage.getItem('phsardom-session'))).toBeNull()
})

test('support help center search and category filter update results', async ({ page }) => {
  await loginAs(page, 'Customer Support / Audit Viewer')
  await page.goto('/support/help')
  await page.getByLabel('Search help articles').fill('shipment')
  await expect(page.getByText(/guide/i).last()).toBeVisible()
  await page.getByRole('button', { name: 'Logistics' }).click()
  await expect(page.getByText('Tracking a shipment and capturing POD')).toBeVisible()
})

test('admin can open pending buyer verification workflow', async ({ page }) => {
  await loginAs(page, 'Super Admin')
  await page.goto('/admin/buyers/3')
  await page.getByRole('button', { name: 'Approve Buyer' }).click()
  await page.getByRole('button', { name: 'Approve' }).last().click()
  await expect(page.getByText(/approved and verified/i)).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('meridian-demo-buyers') || '[]'))
  expect(stored.some((row) => row.id === 3 && row.status === 'Approved')).toBe(true)
})

test('warehouse receiving advances a dock receipt to arrived', async ({ page }) => {
  await loginAs(page, 'Warehouse Manager')
  await page.goto('/warehouse/receiving')
  await page.getByRole('button', { name: 'Arrive' }).first().click()
  await page.getByRole('button', { name: 'Mark arrived' }).click()
  await expect(page.getByText(/arrived on dock/i)).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').receiving?.some((row) => row.status === 'Arrived'))).toBe(true)
})

test('inventory picking and packing actions update ERP workflow state', async ({ page }) => {
  await loginAs(page, 'Inventory Staff')
  await page.goto('/inventory-staff/picking')
  await page.getByRole('button', { name: 'Start picking' }).first().click()
  await page.getByRole('button', { name: 'Start picking' }).last().click()
  await expect(page.getByText(/released to the floor/i)).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').picking?.some((row) => row.status === 'Picking'))).toBe(true)
  await page.goto('/inventory-staff/packing')
  await page.getByRole('button', { name: 'Complete pack' }).first().click()
  await page.getByRole('button', { name: /Complete pack/ }).last().click()
  await expect(page.getByText(/packed to Ready to Ship/i)).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').packing?.some((row) => row.status === 'Ready to Ship'))).toBe(true)
})

test('inventory stock-count variance can be submitted and approved with persistence', async ({ page }) => {
  await loginAs(page, 'Inventory Staff')
  await page.goto('/inventory-staff/stock-count')
  await page.getByRole('button', { name: 'New count' }).click()
  await page.getByLabel('SKU').selectOption({ index: 1 })
  await page.getByLabel('Counted quantity').fill('0')
  await page.getByRole('button', { name: 'Log count' }).click()
  await expect(page.getByText(/variance .* detected/i)).toBeVisible()
  await page.getByRole('button', { name: 'Submit adjustment' }).first().click()
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByText(/variance queued in the Approval Center/i)).toBeVisible()
  const submitted = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').stockCounts || [])
  const pending = submitted.find((row) => row.adjustment === 'Pending')
  expect(pending).toBeTruthy()
  await page.getByRole('button', { name: /open .* account menu/i }).click()
  await page.getByRole('button', { name: 'Super Admin' }).click()
  await page.goto('/approvals')
  await page.getByLabel('Search approvals').fill(pending.number)
  const pendingRow = page.locator('section').filter({ hasText: pending.number })
  await expect(pendingRow).toBeVisible()
  await pendingRow.getByRole('button', { name: 'Approve' }).click()
  await page.getByRole('button', { name: 'Approve', exact: true }).last().click()
  await expect(page.getByText(/Approved/).first()).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').stockCounts?.some((row) => row.adjustment === 'Approved'))).toBe(true)
})

test('inventory stock-count variance can be rejected with a required reason', async ({ page }) => {
  await loginAs(page, 'Inventory Staff')
  await page.goto('/inventory-staff/stock-count')
  await page.getByRole('button', { name: 'New count' }).click()
  await page.getByLabel('SKU').selectOption({ index: 1 })
  await page.getByLabel('Counted quantity').fill('0')
  await page.getByRole('button', { name: 'Log count' }).click()
  await page.getByRole('button', { name: 'Submit adjustment' }).first().click()
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  const submitted = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').stockCounts || [])
  const pending = submitted.find((row) => row.adjustment === 'Pending')
  await page.getByRole('button', { name: /open .* account menu/i }).click()
  await page.getByRole('button', { name: 'Super Admin' }).click()
  await page.goto('/approvals')
  const pendingRow = page.locator('section').filter({ hasText: pending.number })
  await expect(pendingRow).toBeVisible()
  await pendingRow.getByRole('button', { name: 'Reject' }).click()
  await page.getByLabel('Decision reason').fill('Recount required before changing book stock.')
  await page.getByRole('button', { name: 'Submit decision' }).click()
  await expect(page.getByText(new RegExp(`${pending.number}.*Rejected`))).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').stockCounts?.some((row) => row.adjustment === 'Rejected' && row.adjustmentNote))).toBe(true)
})

test('finance records a payment against an invoice', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/invoices')
  await page.getByRole('button', { name: 'Record payment' }).first().click()
  await page.getByLabel('Payment amount').fill('100')
  await page.getByRole('button', { name: 'Record payment' }).last().click()
  await expect(page.getByText(/recorded against/i)).toBeVisible()
  const erp = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1')))
  expect(erp.payments.some((payment) => payment.amount === 100)).toBe(true)
})

test('logistics creates a shipment plan from an open PO balance', async ({ page }) => {
  await loginAs(page, 'Logistics Coordinator')
  await page.goto('/logistics/shipment-planning')
  await page.getByRole('button', { name: /new shipment plan/i }).click()
  await page.getByLabel('Purchase order').selectOption({ index: 1 })
  await page.getByLabel('Quantity to ship').fill('1')
  await page.getByRole('button', { name: 'Create plan' }).click()
  await expect(page.getByText(/planned/i).first()).toBeVisible()
  const erp = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1')))
  expect(erp.plans.length).toBeGreaterThan(2)
})

test('finance drafts and approves a credit note', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/credit-notes')
  await page.getByRole('button', { name: 'New credit note' }).click()
  await page.getByLabel('Invoice').selectOption({ index: 1 })
  await page.getByLabel('Amount (USD)').fill('10')
  await page.getByLabel('Reason').fill('Short shipment adjustment')
  await page.getByRole('button', { name: 'Draft credit note' }).click()
  await expect(page.getByText(/Pending Approval/i).first()).toBeVisible()
  const drafted = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').creditNotes || [])
  expect(drafted.some((row) => row.amount === 10 && row.status === 'Pending Approval')).toBe(true)
  await page.getByRole('button', { name: 'Approve' }).last().click()
  await page.getByRole('button', { name: 'Approve & issue' }).click()
  await expect(page.getByText(/issued to/i).last()).toBeVisible()
})

test('logistics captures delivery proof and advances the delivery status', async ({ page }) => {
  await loginAs(page, 'Logistics Coordinator')
  await page.goto('/logistics/deliveries')
  await page.getByRole('button', { name: 'Capture POD' }).first().click()
  await page.getByRole('button', { name: 'Capture POD' }).last().click()
  await expect(page.getByText(/POD captured/i)).toBeVisible()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}').deliveries?.some((row) => row.status === 'Delivered' && String(row.pod).includes('POD')))).toBe(true)
})

test('manager can delegate a pending approval with an audit note', async ({ page }) => {
  await loginAs(page, 'Sales Manager')
  await page.goto('/approvals')
  await page.getByRole('button', { name: 'Delegate' }).first().click()
  await page.getByLabel('Delegate to').selectOption({ index: 1 })
  await page.getByLabel('Note (optional)').fill('Please review the commercial impact.')
  await page.getByRole('button', { name: 'Delegate request' }).click()
  await expect(page.getByText(/Delegated/).first()).toBeVisible()
})

test('all operational roles respect representative route permissions', async ({ page }) => {
  const cases = [
    ['Verified Buyer', '/buyer/dashboard', '/admin/dashboard'],
    ['Super Admin', '/admin/dashboard', '/buyer/dashboard'],
    ['Account Executive', '/sales/dashboard', '/admin/dashboard'],
    ['Warehouse Manager', '/warehouse/dashboard', '/finance/dashboard'],
    ['Inventory Staff', '/inventory-staff/dashboard', '/warehouse/dashboard'],
    ['Finance / Credit Officer', '/finance/dashboard', '/sales/dashboard'],
    ['Logistics Coordinator', '/logistics/dashboard', '/finance/dashboard'],
    ['Sales Manager', '/approvals', '/buyer/dashboard'],
    ['Customer Support / Audit Viewer', '/support/dashboard', '/admin/dashboard'],
  ]
  for (const [label, allowed, denied] of cases) {
    await loginAs(page, label)
    await page.goto(allowed)
    await expect(page).not.toHaveURL(/\/login/)
    await page.goto(denied)
    await expect(page.getByText('Role-Based Access Control')).toBeVisible()
  }
})
