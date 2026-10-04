import { chromium } from 'playwright'

const URL = process.env.URL || 'https://holdwatch-dashboard.onrender.com'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await ctx.newPage()

const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

console.log(`── loading ${URL} ──`)
const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 })
console.log(`  HTTP ${resp.status()}`)
console.log('  waiting for the dashboard to populate (AI calls on first paint)…')
await page.waitForSelector('.card', { timeout: 120000 }).catch(() => {})

const r = await page.evaluate(() => {
  const t = document.body.innerText
  return {
    title: document.title,
    stats: [...document.querySelectorAll('.stat')].map((s) =>
      s.innerText.replace(/\n/g, ' ')),
    cards: document.querySelectorAll('.card').length,
    has4200: t.includes('4,200.00'),
    hasJohnDoe: t.includes('John Doe'),
    hasSignatureVerified: t.includes('signature verified'),
    hasCauseUnknown: /cause unknown/i.test(t),
    hasAI: t.includes('AI'),
  }
})

console.log('\n── what a judge actually sees ──')
console.log(JSON.stringify(r, null, 1))
if (errors.length) {
  console.log('\n── console errors ──')
  for (const e of errors.slice(0, 5)) console.log('  ' + e)
} else {
  console.log('\n  no console errors')
}

await page.screenshot({ path: '/root/web3alphatester/paypal/video/deploy_dashboard.png' })
console.log('\n  screenshot -> video/deploy_dashboard.png')

await browser.close()
