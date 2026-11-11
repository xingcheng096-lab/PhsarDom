import { expect, test } from '@playwright/test'

async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

test('finance invoice ledger records a partial payment and persists it', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/invoices')
  await expect(page.getByRole('heading', { name: /Invoices & Receivables/i })).toBeVisible()
  const row = page.getByRole('row').filter({ hasText: 'INV-2026-3901' })
  await row.getByRole('button', { name: 'Record payment' }).click()
  await page.getByLabel('Payment amount').fill('100')
  await page.getByLabel('Reference (optional)').fill('E2E-FIN-PAY-1')
  await page.getByRole('button', { name: 'Record payment' }).last().click()
  await expect(page.getByText(/recorded against INV-2026-3901/i)).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(stored.payments.some((payment) => payment.reference === 'E2E-FIN-PAY-1')).toBe(true)
  expect(stored.audit.some((entry) => entry.action === 'PAYMENT_RECORDED' && entry.actor?.role === 'finance')).toBe(true)
  await page.reload()
  await expect(page.getByText('Invoices & Receivables')).toBeVisible()
})

test('buyer invoice view is ownership-scoped', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/invoices')
  await expect(page.getByRole('main').getByText('Atlas Hospitality Group')).toBeVisible()
  await expect(page.getByText('Coastal Education Services')).toHaveCount(0)
})

test('unauthorized buyer cannot record finance payment', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/invoices')
  await expect(page.getByRole('button', { name: 'Record payment' })).toHaveCount(0)
})

test('authorized admin generates an invoice from an eligible PO and sees persisted audit', async ({ page }) => {
  await loginAs(page, 'Super Admin')
  await page.goto('/admin/purchase-orders/1')
  await expect(page.getByRole('button', { name: 'Generate Invoice' })).toBeVisible()
  await page.getByRole('button', { name: 'Generate Invoice' }).click()
  await expect(page).toHaveURL(/\/admin\/invoices\/INV-/)
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  const created = state.invoices.find((invoice) => invoice.invoiceId === page.url().split('/').pop()) || state.invoices.find((invoice) => invoice.po === 'PO-2026-2142')
  expect(created).toBeTruthy()
  expect(state.audit.some((entry) => entry.action === 'INVOICE_GENERATED' && entry.actor?.role === 'admin')).toBe(true)
  await page.getByRole('button', { name: 'Activity' }).click()
  await expect(page.getByText('INVOICE_GENERATED')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Activity' }).click()
  await expect(page.getByText('INVOICE_GENERATED')).toBeVisible()
})

test('finance actor adjusts buyer credit limit and unauthorized buyer cannot use the control', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/buyers/1')
  await page.getByRole('button', { name: 'Adjust credit limit' }).click()
  await page.getByLabel('Credit limit (USD)').fill('260000')
  await page.getByRole('button', { name: 'Save credit limit' }).click()
  await expect(page.getByText(/Credit limit updated/i)).toBeVisible()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(state.creditAccounts.find((account) => account.buyerId === 1)?.creditLimit).toBe(260000)
  expect(state.audit.some((entry) => entry.action === 'CREDIT_LIMIT_UPDATED' && entry.actor?.role === 'finance')).toBe(true)
  await loginAs(page, 'Verified Buyer')
  await page.goto('/buyer/credit')
  await expect(page.getByRole('button', { name: 'Adjust credit limit' })).toHaveCount(0)
})

test('visible credit note validation rejects excessive amount without mutation', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/credit-notes')
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  await page.getByRole('button', { name: 'New credit note' }).click()
  await page.getByLabel('Invoice').selectOption({ index: 1 })
  await page.getByLabel('Credit amount').fill('999999999')
  await page.getByLabel('Reason').fill('E2E excessive credit')
  await page.getByRole('button', { name: 'Draft credit note' }).click()
  await expect(page.getByText(/within its balance|eligible|exceeds/i)).toBeVisible()
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(after.audit.length).toBe(before.audit.length)
})

test('legacy credit note approval remains functional after finance integration', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/credit-notes')
  await expect(page.getByText('Pending Approval').first()).toBeVisible()
  await page.getByRole('button', { name: 'Approve' }).last().click()
  await page.getByRole('button', { name: 'Approve & issue' }).click()
  await expect(page.getByText(/issued to/i).last()).toBeVisible()
})
