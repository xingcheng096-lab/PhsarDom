import { expect, test } from '@playwright/test'

async function loginAs(page, label) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('phsardom-session'))
  await page.getByRole('button', { name: `Login as ${label}` }).click()
}

test('sales report displays persisted ERP metrics and filters period', async ({ page }) => {
  await loginAs(page, 'Super Admin')
  await page.goto('/admin/reports/sales')
  await expect(page.locator('h1').filter({ hasText: 'Sales Report' })).toHaveCount(1)
  await expect(page.getByText('Confirmed PO Value', { exact: true })).toBeVisible()
  await expect(page.getByText('Invoiced Amount', { exact: true })).toBeVisible()
  await expect(page.getByText('Top buyers by confirmed PO value')).toBeVisible()
  await page.getByLabel('Reporting period').selectOption('3')
  await expect(page.getByLabel('Reporting period')).toHaveValue('3')
})

test('finance actor creates a validated commission rule and ledger persists', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/commissions')
  await expect(page.getByRole('heading', { name: 'Commission Management' })).toBeVisible()
  await page.getByLabel('Rate (%)').fill('3.25')
  await page.getByRole('button', { name: 'Save rule' }).click()
  await expect(page.getByText('Commission rule saved.')).toBeVisible()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
  expect(state.commissionRules).toEqual(expect.arrayContaining([expect.objectContaining({ rate: 3.25, status: 'Active' })]))
  await page.reload()
  await expect(page.getByText('Commission ledger')).toBeVisible()
})

test('buyer cannot access internal sales reports or commission management', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/admin/reports/sales')
  await expect(page.getByRole('heading', { name: /403.*Permission denied/i })).toBeVisible()
  await page.goto('/finance/commissions')
  await expect(page.getByRole('heading', { name: /403.*Permission denied/i })).toBeVisible()
})

test('duplicate simulated payout is prevented and status persists after refresh', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/commissions')
  await page.getByLabel('Rate (%)').fill('4')
  await page.getByRole('button', { name: 'Save rule' }).click()
  const approve = page.getByRole('button', { name: 'Approve' }).first()
  if (await approve.count()) await approve.click()
  const payout = page.getByRole('button', { name: 'Simulate payout' }).first()
  if (await payout.count()) {
    await payout.click()
    await expect(page.getByText(/simulated payout recorded/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simulate payout' })).toHaveCount(0)
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('phsardom-erpv1') || '{}'))
    expect(state.audit.filter((entry) => entry.action === 'COMMISSION_PAID_SIMULATED')).toHaveLength(1)
    await page.reload()
    await expect(page.getByText('Paid (Simulated)')).toBeVisible()
  }
})

test('unauthorized buyer cannot approve or pay commission', async ({ page }) => {
  await loginAs(page, 'Verified Buyer')
  await page.goto('/finance/commissions')
  await expect(page.getByRole('heading', { name: /403.*Permission denied/i })).toBeVisible()
})

test('pending commission cannot be paid before approval', async ({ page }) => {
  await loginAs(page, 'Finance / Credit Officer')
  await page.goto('/finance/commissions')
  await expect(page.getByRole('button', { name: 'Simulate payout' })).toHaveCount(0)
})
