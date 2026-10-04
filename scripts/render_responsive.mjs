#!/usr/bin/env node
/**
 * render_responsive.mjs — screenshot the built site at device widths.
 *
 * Used instead of in-page resizing because the browser harness could not
 * resize the viewport reliably. This drives a real headless browser through
 * Playwright's CDP-equivalent API so the responsive claims are verified against
 * actual renders, not inferred from the stylesheet.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const OUT = '/root/holdwatch-site/.responsive'
const SIZES = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const report = []

for (const s of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  const metrics = await page.evaluate(() => {
    const de = document.documentElement
    const cols = (sel) => {
      const el = document.querySelector(sel)
      return el ? getComputedStyle(el).gridTemplateColumns.split(' ').length : -1
    }
    const offenders = []
    // An element inside a scroll container is not an overflow bug — the
    // 19-row reference table is deliberately wider than a phone and scrolls
    // inside .explorer__table. Walking ancestors for overflow-x != visible
    // distinguishes "escapes the viewport" from "scrolls on purpose".
    const inScroller = (el) => {
      let n = el.parentElement
      while (n && n !== document.body) {
        const cs = getComputedStyle(n)
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowX === 'hidden')
          return true
        n = n.parentElement
      }
      return false
    }
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
        const cs = getComputedStyle(el)
        if (cs.overflowX === 'visible' && cs.position !== 'fixed' && !inScroller(el)) {
          offenders.push(
            `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`,
          )
        }
      }
    })
    return {
      clientWidth: de.clientWidth,
      scrollWidth: de.scrollWidth,
      horizontalOverflowPx: de.scrollWidth - de.clientWidth,
      heroCols: cols('.hero__inner'),
      bentoCols: cols('.bento'),
      proofCols: cols('.proof'),
      walkCols: cols('.walk'),
      ctaCols: cols('.cta__inner'),
      footCols: cols('.foot__cols'),
      navLinks: getComputedStyle(document.querySelector('.nav__links')).display,
      offenders: [...new Set(offenders)].slice(0, 6),
    }
  })

  await page.screenshot({ path: `${OUT}/${s.name}-full.png`, fullPage: true })
  await page.screenshot({ path: `${OUT}/${s.name}-fold.png` })
  report.push({ size: s.name, ...metrics })
  await ctx.close()
}

await browser.close()

console.log(JSON.stringify(report, null, 1))
const bad = report.filter(
  (r) => r.horizontalOverflowPx > 0 || r.offenders.length > 0,
)
console.log(
  bad.length === 0
    ? '\nPASS: no horizontal overflow and no overflowing elements at any width'
    : `\nFAIL: ${bad.map((b) => b.size).join(', ')}`,
)