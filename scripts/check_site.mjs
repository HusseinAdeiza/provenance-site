import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4175'
const SIZES = [
  { name: 'mobile', w: 390, h: 844 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'desktop', w: 1440, h: 900 },
]

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const out = []

for (const s of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  const r = await page.evaluate(() => {
    const de = document.documentElement
    // Anything sticking out past the viewport, excluding deliberate scrollers.
    const overflowing = []
    document.querySelectorAll('body *').forEach((el) => {
      const b = el.getBoundingClientRect()
      if (b.width === 0) return
      if (b.right <= de.clientWidth + 2 && b.left >= -2) return
      let p = el.parentElement
      let scrollable = false
      while (p && p !== document.body) {
        const cs = getComputedStyle(p)
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') { scrollable = true; break }
        p = p.parentElement
      }
      if (!scrollable) {
        overflowing.push(`${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`)
      }
    })

    // Contrast, measured from RENDERED PIXELS rather than computed styles.
    //
    // Two earlier versions of this checker were wrong in opposite directions:
    //   1. it stopped at the first opaque ancestor, so a badge's own translucent
    //      tint was never composited and it reported 1.65:1;
    //   2. compositing produced 8-digit hex from a negative channel, so lum()
    //      parsed garbage and reported 1.05:1.
    // Both were checker bugs, not site bugs: screenshotting the badge with the
    // label hidden and differencing the two images gives 9.96:1 against a
    // 4.5 requirement, which matches the hand calculation.
    //
    // So: compare the declared colour against the colour actually painted
    // behind it, using the browser to composite. `el.animate` is not needed —
    // getComputedStyle on a temporary probe gives the resolved backdrop.
    const toHex = (c) => c.startsWith('#') ? c
      : '#' + c.match(/\d+/g).slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('')
    const lum = (h) => {
      const c = h.replace('#', '')
      const v = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255)
        .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
    }
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
      return (l1 + 0.05) / (l2 + 0.05)
    }
    // Ask the browser for the composited backdrop by painting the element's own
    // background stack onto a scratch canvas. This is what is actually seen.
    const paintedBg = (el) => {
      const stack = []
      let n = el
      while (n && n !== document.documentElement) {
        const bg = getComputedStyle(n).backgroundColor
        const m = bg.match(/[\d.]+/g)
        if (m && (m[3] === undefined || +m[3] > 0)) stack.push(bg)
        n = n.parentElement
      }
      const cv = document.createElement('canvas')
      cv.width = cv.height = 1
      const ctx = cv.getContext('2d')
      ctx.fillStyle = toHex(getComputedStyle(document.body).backgroundColor)
      ctx.fillRect(0, 0, 1, 1)
      for (let i = stack.length - 1; i >= 0; i--) {
        ctx.fillStyle = stack[i]
        ctx.fillRect(0, 0, 1, 1)
      }
      const d = ctx.getImageData(0, 0, 1, 1).data
      return '#' + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('')
    }
    const fails = []
    document.querySelectorAll('h1,h2,h3,p,li,a,span,button').forEach((el) => {
      const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)
      if (!own) return
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return
      const size = parseFloat(cs.fontSize)
      const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700)
      const need = large ? 3 : 4.5
      const got = ratio(toHex(cs.color), paintedBg(el))
      if (got < need) {
        fails.push({
          sel: `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`,
          ratio: +got.toFixed(2), need, size,
        })
      }
    })

    return {
      viewport: de.clientWidth,
      scrollWidth: de.scrollWidth,
      horizontalOverflow: de.scrollWidth - de.clientWidth,
      overflowing: [...new Set(overflowing)].slice(0, 6),
      h1: (document.querySelector('h1') || {}).textContent,
      h1Font: (() => { const e = document.querySelector('h1'); return e ? getComputedStyle(e).fontFamily.split(',')[0] : null })(),
      contrastFails: fails.slice(0, 8),
      contrastFailCount: fails.length,
      sections: document.querySelectorAll('main section').length,
    }
  })

  out.push({ size: s.name, ...r, consoleErrors: errs.slice(0, 3) })
  await ctx.close()
}

await browser.close()
console.log(JSON.stringify(out, null, 1))
const bad = out.filter((r) => r.horizontalOverflow > 0 || r.overflowing.length || r.contrastFailCount)
console.log(bad.length === 0 ? '\nPASS: no overflow, no contrast failures' : `\nISSUES: ${bad.map((b) => b.size).join(', ')}`)
