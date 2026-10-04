import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// The table is wider than a phone by design and lives inside a scroll
// container. Verify the CONTAINER clips it, so the page itself never scrolls.
const r = await page.evaluate(() => {
  const de = document.documentElement
  const sc = document.querySelector('.explorer__table')
  const tbl = document.querySelector('.etable')
  const cs = getComputedStyle(sc)
  return {
    pageScrollWidth: de.scrollWidth,
    pageClientWidth: de.clientWidth,
    pageOverflow: de.scrollWidth - de.clientWidth,
    scrollerOverflowX: cs.overflowX,
    scrollerWidth: Math.round(sc.getBoundingClientRect().width),
    tableWidth: Math.round(tbl.getBoundingClientRect().width),
    tableExceedsScroller:
      tbl.getBoundingClientRect().width > sc.getBoundingClientRect().width,
    // is the container itself within the viewport?
    scrollerRight: Math.round(sc.getBoundingClientRect().right),
  }
})

// confirm the scroller is actually usable by touch-scroll
await page.evaluate(() => {
  document.querySelector('.explorer__table').scrollLeft = 400
})
const scrolled = await page.evaluate(
  () => document.querySelector('.explorer__table').scrollLeft,
)

console.log(JSON.stringify({ ...r, scrollerActuallyScrolls: scrolled > 0, scrollLeftAfter: scrolled }, null, 1))
await browser.close()