const fs = require('fs')
const { chromium } = require('@playwright/test')
const crypto = require('crypto')

const env = Object.fromEntries(fs.readFileSync('backend/.env', 'utf8').split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => { const i = line.indexOf('='); let value = line.slice(i + 1); if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1); return [line.slice(0, i), value] }))
const frontend = 'http://127.0.0.1:5185'
const backend = 'http://127.0.0.1:8000'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('request', async (request) => { if (request.url().includes('/api/auth/login')) { const headers = await request.allHeaders(); const cookies = await context.cookies(); const xsrf = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value || ''; const raw = await page.evaluate(() => document.cookie.split('; ').find((entry) => entry.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') || ''); const fingerprint = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 12); console.error(`LOGIN_HEADERS=${Object.keys(headers).join(',')} COOKIE_RAW_FP=${fingerprint(raw)} COOKIE_CONTEXT_FP=${fingerprint(xsrf)} COOKIE_DECODED_FP=${fingerprint(decodeURIComponent(raw))} COOKIE_DOUBLE_DECODED_FP=${fingerprint(decodeURIComponent(decodeURIComponent(raw)))} XSRF_HEADER_FP=${fingerprint(headers['x-xsrf-token'] || '')} SESSION_COOKIE_PRESENT=${cookies.some((cookie) => cookie.name === 'laravel-session')}`) } })
  const result = {}
  const login = async (email, password) => {
    await page.goto(`${frontend}/login`)
    page.on('response', async (response) => { if (response.url().includes('/api/auth/login')) console.error(`LOGIN_RESPONSE=${response.status()} BODY=${(await response.text()).slice(0, 220)}`) })
    await page.getByLabel('Business email').fill(email)
    await page.getByLabel('Password').fill(password)
    console.error(`LOGIN_FORM_VALID=${await page.locator('form').evaluate((form) => form.checkValidity())}`)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForLoadState('networkidle')
    console.error(`LOGIN_URL=${page.url()}`)
    console.error(`LOGIN_TEXT=${(await page.locator('body').innerText()).slice(0, 350)}`)
  }
  const api = async (path, options = {}) => page.evaluate(async ({ path, options, backend }) => { const response = await fetch(`${backend}${path}`, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.headers || {}) } }); return { status: response.status, body: await response.json().catch(() => ({})) } }, { path, options, backend })
  await login(env.DEMO_BUYER_EMAIL, env.DEMO_BUYER_PASSWORD)
  result.buyerMe = (await api('/api/auth/me')).status
  page.on('console', (message) => console.error(`CONSOLE ${message.type()}: ${message.text()}`))
  page.on('requestfailed', (request) => console.error(`REQUEST_FAILED ${request.url()} ${request.failure()?.errorText || ''}`))
  await page.goto(`${frontend}/buyer/rfqs/new?productId=1&quantity=10`)
  console.error(`RFQ_URL=${page.url()}`)
  await page.screenshot({ path: 'artifacts/rfq-failure.png', fullPage: true }).catch(() => {})
  console.error(`RFQ_TEXT=${(await page.locator('body').innerText()).slice(0, 1000)}`)
  await page.getByLabel('Required delivery date').fill('2027-01-15')
  await page.getByLabel('Shipping location').fill('Phnom Penh')
  await page.getByRole('button', { name: /submit rfq/i }).click()
  await page.waitForURL('**/buyer/rfqs')
  const rfqs = await api('/api/rfqs'); result.rfqStatus = rfqs.status; result.rfqId = rfqs.body.data?.[0]?.id
  await page.getByRole('button', { name: /logout/i }).click().catch(() => {})
  await login(env.DEMO_ADMIN_EMAIL, env.DEMO_ADMIN_PASSWORD)
  await page.goto(`${frontend}/admin/rfqs`)
  const price = page.locator('input[type="number"]').first(); await price.fill('25'); await page.getByRole('button', { name: /issue quotation/i }).first().click(); await page.waitForTimeout(300)
  const quotations = await api('/api/quotations'); result.quotationStatus = quotations.status; result.quotationId = quotations.body.data?.[0]?.id
  await page.getByRole('button', { name: /logout/i }).click().catch(() => {})
  await login(env.DEMO_BUYER_EMAIL, env.DEMO_BUYER_PASSWORD)
  await page.goto(`${frontend}/buyer/quotations`)
  await page.getByRole('button', { name: /accept & create po/i }).first().click()
  await page.waitForTimeout(500)
  const orders = await api('/api/purchase-orders'); result.poStatus = orders.status; result.poId = orders.body.data?.[0]?.id; result.poCount = orders.body.data?.length
  await page.reload(); result.poVisibleAfterRefresh = await page.getByText(new RegExp(`PO #${result.poId}`)).isVisible().catch(() => false)
  await page.goto(`${frontend}/buyer/quotations`); await page.getByRole('button', { name: /accept & create po/i }).first().click(); await page.waitForTimeout(300)
  const retry = await api('/api/purchase-orders'); result.retryCount = retry.body.data?.length
  console.log(JSON.stringify(result))
  await browser.close()
})().catch(async (error) => { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1 })
