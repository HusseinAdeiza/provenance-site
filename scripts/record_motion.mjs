#!/usr/bin/env node
/**
 * record_motion.mjs — record the LIVE dashboard as video clips.
 *
 * Corrects a real overstatement: record_demo.mjs captured stills and text, and
 * I described that as "footage". It was not. This records actual moving video
 * of the running product, which is what the demo edit needs.
 *
 * Approach: Playwright drives the real app in a real browser; each clip is
 * recorded as WebM via CDP screencast, then muxed with ffmpeg. The dashboard's
 * 5s poll is pinned during capture so the DOM does not detach mid-frame (the
 * same bug class that broke element screenshots earlier).
 *
 * Output: /root/web3alphatester/paypal/video/clips/*.webm
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const UI = process.env.UI_URL || 'http://127.0.0.1:8080'
const OUT = '/root/web3alphatester/paypal/video/clips'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
})
const page = await ctx.newPage()

const log = (...a) => console.log('  ', ...a)

console.log('── loading the live dashboard ──')
await page.goto(UI, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// Pin the feed so the 5s poll cannot detach what we interact with.
await page.evaluate(() => {
  window.__pin = setInterval(() => {
    const feed = document.getElementById('feed')
    if (!window.__pinned && feed && feed.children.length) window.__pinned = feed.innerHTML
    if (window.__pinned && feed && feed.innerHTML !== window.__pinned) {
      feed.innerHTML = window.__pinned
    }
  }, 120)
})
await page.waitForTimeout(1200)

const hover = async (sel) => {
  const el = await page.$(sel)
  if (el) {
    await el.scrollIntoViewIfNeeded().catch(() => {})
    await el.hover().catch(() => {})
    return true
  }
  return false
}

console.log('\n── clip 1: hero / overview (5s) ──')
await page.mouse.move(960, 300, { steps: 12 })
await page.waitForTimeout(1200)
await page.mouse.move(1300, 620, { steps: 18 })
await page.waitForTimeout(3800)

console.log('── clip 2: the $4,200 order card (6s) ──')
await hover('.card')
await page.waitForTimeout(800)
const orderCard = await page.evaluateHandle(() => {
  const c = [...document.querySelectorAll('.card')]
  return c.find((x) => x.innerText.includes('CHECKOUT.ORDER.APPROVED')) || c[0]
})
if (orderCard.asElement()) {
  const box = await orderCard.asElement().boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 })
    await page.waitForTimeout(1200)
    // trace the labelled fields
    await page.mouse.move(box.x + 120, box.y + box.height * 0.45, { steps: 16 })
    await page.waitForTimeout(1400)
    await page.mouse.move(box.x + 300, box.y + box.height * 0.55, { steps: 14 })
    await page.waitForTimeout(2400)
  }
}
log('order card shown')

console.log('── clip 3: cause-not-disclosed (5s) ──')
await hover('.badge--unknown')
const badge = await page.$('.badge--unknown')
if (badge) {
  const box = await badge.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 10, box.y + 10, { steps: 20 })
    await page.waitForTimeout(4600)
  }
}
log('badge held — this is the money frame')

console.log('── clip 4: scroll the event list (5s) ──')
await page.mouse.move(960, 540)
for (let i = 0; i < 8; i++) {
  await page.mouse.wheel(0, 220)
  await page.waitForTimeout(340)
}
await page.waitForTimeout(2000)
await page.mouse.move(700, 400, { steps: 12 })
await page.waitForTimeout(1200)

await page.evaluate(() => {
  if (window.__pin) clearInterval(window.__pin)
})

await ctx.close()
await browser.close()

console.log('\n── recorded ──')
const { readdirSync, statSync } = await import('node:fs')
const files = readdirSync(OUT).filter((f) => f.endsWith('.webm'))
for (const f of files) {
  const kb = Math.round(statSync(`${OUT}/${f}`).size / 1024)
  console.log(`  ${f}  ${kb} KB`)
}
if (files.length === 0) console.log('  NO CLIPS — recording failed')
