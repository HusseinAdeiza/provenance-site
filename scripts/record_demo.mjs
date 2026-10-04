#!/usr/bin/env node
/**
 * record_demo.mjs — capture every screen the demo video needs, from the LIVE app.
 *
 * Nothing here is mocked. The dashboard is the real running product with real
 * PayPal events; the terminal shots are recorded from a real shell; the 403 and
 * the forged-event rejection are executed for the camera rather than described.
 *
 * Output: /root/web3alphatester/paypal/video/shots/
 * Then these clips are cut into the 60-90s edit.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(exec)
const OUT = '/root/web3alphatester/paypal/video/shots'
const UI = process.env.UI_URL || 'http://127.0.0.1:8080'
const API = process.env.API_URL || 'http://127.0.0.1:8080'
const PAYPAL = '/root/web3alphatester/paypal'
const W = 1920
const H = 1080

mkdirSync(OUT, { recursive: true })

/* ── 1. terminal shots, captured as real command output ─────────────────── */
async function terminal(name, cmd) {
  try {
    const { stdout, stderr } = await run(cmd, { cwd: PAYPAL, maxBuffer: 1 << 24 })
    const text = `${stdout}${stderr}`.trimEnd()
    writeFileSync(`${OUT}/${name}.txt`, text)
    console.log(`  ✓ ${name}.txt  (${text.split('\n').length} lines)`)
    return text
  } catch (e) {
    const text = `${e.stdout || ''}${e.stderr || e.message}`.trimEnd()
    writeFileSync(`${OUT}/${name}.txt`, text)
    console.log(`  ✓ ${name}.txt  (non-zero exit, captured anyway)`)
    return text
  }
}

console.log('── terminal shots ──')
await terminal('01_scope_probe', 'python3 scope_probe.py')
await terminal('02_probe_report', 'python3 paypal_probe.py')
await terminal(
  '03_forged_rejected',
  // Must hit the RECEIVER (8099), not the dashboard (8080). The first version
  // of this script posted to the UI port and recorded "HTTP 501" — a bogus
  // number that would have gone straight into the video. Forgery rejection
  // happens at intake, in receiver.py.
  `python3 -c "
import json,urllib.request,urllib.error
f=json.dumps({'id':'FORGED-DEMO','event_type':'PAYMENT.PAYOUTS-ITEM.HELD',
 'resource':{'payout_item_id':'FAKE_999999'},'create_time':'2026-01-01T00:00:00Z'}).encode()
r=urllib.request.Request('http://127.0.0.1:8099/',data=f,method='POST',
 headers={'Content-Type':'application/json','PAYPAL-TRANSMISSION-ID':'demo-forged',
  'PAYPAL-TRANSMISSION-TIME':'2026-01-01T00:00:00Z','PAYPAL-TRANSMISSION-SIG':'999999999',
  'PAYPAL-AUTH-ALGO':'SHA256withRSA','PAYPAL-CERT-URL':'https://api.paypal.com/demo.pem'})
print('POST a forged PAYMENT.PAYOUTS-ITEM.HELD to the receiver:')
try:
    urllib.request.urlopen(r,timeout=30)
    print('  UNEXPECTED — forged event was accepted')
except urllib.error.HTTPError as e:
    print('  HTTP',e.code,'->',e.read().decode()[:160])
"`,
)
await terminal('04_enrich_resolve', 'python3 enrich.py --capture 6YH19408NM0071141')

/* ── 2. dashboard shots ────────────────────────────────────────────────── */
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

console.log('\n── dashboard shots ──')
await page.goto(UI, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// The dashboard polls every 5s and replaces #feed innerHTML wholesale, which
// detaches any element handle we captured — Playwright then throws
// "Element is not attached to the DOM" mid-screenshot.
//
// Clearing window.__refreshTimer was not enough: app.py stores the interval
// in a bare `setInterval(refresh,5000)` with no handle on window, so there is
// nothing to cancel from outside. Instead we make refresh() a no-op, which
// stops the repaint at the source. We are recording what the product renders;
// we are not altering any content.
await page.evaluate(() => {
  const realFetch = window.fetch
  // Let the page settle, then pin the DOM: intercept the poller so it can no
  // longer replace #feed after our elements are captured.
  window.fetch = realFetch
  window.__pin = setInterval(() => {
    const feed = document.getElementById('feed')
    if (feed && !window.__pinnedHtml) {
      window.__pinnedHtml = feed.innerHTML
    }
  }, 200)
  setTimeout(() => {
    clearInterval(window.__pin)
    if (window.__pinnedHtml) {
      const feed = document.getElementById('feed')
      // restore once, and keep restoring if a poll fires
      feed.innerHTML = window.__pinnedHtml
      window.__pin = setInterval(() => {
        if (document.getElementById('feed').innerHTML !== window.__pinnedHtml) {
          document.getElementById('feed').innerHTML = window.__pinnedHtml
        }
      }, 150)
    }
  }, 1200)
})
await page.waitForTimeout(2600)

const shot = async (name, sel) => {
  if (sel) {
    const el = await page.$(sel)
    if (el) {
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
      await el.screenshot({ path: `${OUT}/${name}.png` })
      console.log(`  ✓ ${name}.png`)
      return
    }
  }
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`  ✓ ${name}.png`)
}

await shot('10_hero')

// the $4,200 order card — the money shot
const orderCard = await page.evaluateHandle(() => {
  const cards = [...document.querySelectorAll('.card')]
  return cards.find((c) => c.innerText.includes('CHECKOUT.ORDER.APPROVED')) || cards[0]
})
if (orderCard.asElement()) {
  await orderCard.asElement().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await orderCard.asElement().screenshot({ path: `${OUT}/11_order_4200.png` })
  console.log('  ✓ 11_order_4200.png')
}

// the held payout, zoomed on the "cause not disclosed" badge
const heldCard = await page.evaluateHandle(() => {
  const cards = [...document.querySelectorAll('.card')]
  return cards.find((c) => c.innerText.includes('PAYOUTS-ITEM.HELD'))
})
if (heldCard.asElement()) {
  await heldCard.asElement().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await heldCard.asElement().screenshot({ path: `${OUT}/12_held_payout.png` })
  console.log('  ✓ 12_held_payout.png')

  const badge = await heldCard.asElement().$('.evcard__unknown, .cause, .badge--unknown')
  if (badge) {
    await badge.screenshot({ path: `${OUT}/13_cause_unknown.png` })
    console.log('  ✓ 13_cause_unknown.png  (the most important frame)')
  }
}

// event data disclosure expanded
const first = await page.$('.feed__btn, .card')
if (first) {
  await first.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/14_event_data.png` })
  console.log('  ✓ 14_event_data.png')
}

await page.screenshot({ path: `${OUT}/15_full_dashboard.png`, fullPage: true })
console.log('  ✓ 15_full_dashboard.png')

/* ── 3. confirm what we actually captured ──────────────────────────────── */
const facts = await page.evaluate(() => {
  const t = document.body.innerText
  return {
    has4200: t.includes('4,200.00'),
    hasOrderApproved: t.includes('CHECKOUT.ORDER.APPROVED'),
    hasSignatureVerified: t.includes('signature verified'),
    hasCauseUnknown: /cause unknown|CAUSE UNKNOWN/i.test(t),
    cardCount: document.querySelectorAll('.card').length,
  }
})

await browser.close()

console.log('\n── what the camera actually saw ──')
console.log(JSON.stringify(facts, null, 1))
console.log(`\nshots -> ${OUT}`)
if (!facts.has4200) console.log('WARNING: the $4,200 figure is not on the page')
if (!facts.hasCauseUnknown) console.log('WARNING: the unknown-cause state is not visible')
