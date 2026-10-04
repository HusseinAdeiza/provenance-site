import { chromium } from 'playwright'

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  args: ['--no-sandbox']
})
for (const w of [390, 768, 1440]) {
  const pg = await browser.newPage({ viewport: { width: w, height: 900 } })
  const errs = []
  pg.on('console', m => m.type() === 'error' && !m.text().includes('favicon') && errs.push(m.text()))
  pg.on('pageerror', e => errs.push(String(e)))
  await pg.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' })
  const r = await pg.evaluate(() => {
    const doc = document.documentElement
    const grids = [...document.querySelectorAll('.cards3,.proof-grid,.ladder')].map(
      el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)
    const t = document.querySelector('.tbl-scroll')
    return {
      overflowX: doc.scrollWidth > window.innerWidth + 1,
      scrollW: doc.scrollWidth, winW: window.innerWidth,
      navDisplay: getComputedStyle(document.querySelector('.nav__links')).display,
      grids,
      tblScrolls: t ? t.scrollWidth > t.clientWidth : null,
    }
  })
  console.log(w, JSON.stringify(r), 'console_errors:', errs.length)
  await pg.screenshot({ path: `/tmp/prov_site_${w}.png` })
  await pg.close()
}
await browser.close()
