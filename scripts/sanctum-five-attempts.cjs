const fs = require('fs')
const { chromium } = require('@playwright/test')

const env = Object.fromEntries(fs.readFileSync('backend/.env', 'utf8').split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => { const i = line.indexOf('='); let value = line.slice(i + 1); if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1); return [line.slice(0, i), value] }))
const frontend = 'http://127.0.0.1:5183'
const backend = 'http://127.0.0.1:8000'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const context = await browser.newContext()
    const page = await context.newPage()
    const result = { attempt }
    await page.goto(`${frontend}/login`)
    result.before = await page.evaluate(async (backend) => (await fetch(`${backend}/api/debug/session-state`, { credentials: 'include' })).json(), backend)
    result.csrf = await page.evaluate(async (backend) => (await fetch(`${backend}/sanctum/csrf-cookie`, { credentials: 'include' })).status, backend)
    result.afterCsrf = await page.evaluate(async (backend) => (await fetch(`${backend}/api/debug/session-state`, { credentials: 'include' })).json(), backend)
    result.login = await page.evaluate(async ({ backend, email, password }) => { const item = document.cookie.split('; ').find((entry) => entry.startsWith('XSRF-TOKEN=')); const token = item ? decodeURIComponent(item.split('=').slice(1).join('=')) : ''; const response = await fetch(`${backend}/api/auth/login`, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token }, body: JSON.stringify({ email, password }) }); return response.status }, { backend, email: env.DEMO_BUYER_EMAIL, password: env.DEMO_BUYER_PASSWORD })
    result.me = await page.evaluate(async (backend) => (await fetch(`${backend}/api/auth/me`, { credentials: 'include', headers: { Accept: 'application/json' } })).status, backend)
    results.push(result)
    await context.close()
  }
  console.log(JSON.stringify(results))
  await browser.close()
})().catch((error) => { console.error(error.message); process.exitCode = 1 })
