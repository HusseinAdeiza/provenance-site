#!/usr/bin/env node
/**
 * build.ts — read the LIVE product and the eval proof, bake the figures, then build.
 *
 * The site must never publish a number we cannot verify. This runs BEFORE
 * vite build and exits non-zero if:
 *   - the roles UI / ledger stack cannot be reached, OR
 *   - proof.json is missing, stale, or reports ANY failure.
 *
 * Every figure on the page comes from one of those two sources. Nothing is
 * typed by hand. (Same gate pattern as the HoldWatch site, with one upgrade:
 * the numbers are eval OUTPUT, so a claim on the page and a check in the eval
 * suite are the same artifact.)
 *
 *   npm run build   ->   node build.ts && tsc --noEmit && vite build
 *
 * Env:
 *   UI_URL    the roles UI to read        (default http://127.0.0.1:8090)
 *   PROOF     path to proof.json          (default ../provenance/proof.json)
 *   MAX_AGE_HOURS  freshness cap for proof.json (default 24)
 */
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, 'src/data/site.generated.json')

const UI = process.env.UI_URL ?? 'http://127.0.0.1:8090'
const PROOF_PATH = process.env.PROOF ?? resolve(HERE, '../provenance/proof.json')
const MAX_AGE_HOURS = Number(process.env.MAX_AGE_HOURS ?? 24)
const TIMEOUT_MS = 25_000

function die(msg: string, detail?: unknown): never {
  console.error(`\n  BUILD STOPPED — ${msg}\n`)
  if (detail) console.error(String(detail).slice(0, 600), '\n')
  console.error('  Refusing to publish figures we cannot verify.')
  process.exit(1)
}

async function get(url: string): Promise<Response> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { signal: ctl.signal })
  } finally {
    clearTimeout(t)
  }
}

// ── 1. the live stack ─────────────────────────────────────────────────────
console.log(`  reading live product: ${UI}/api/state`)
let state: {
  views: Record<string, Array<{ template: string; payload: Record<string, string> }>>
  strangerVisibleHolds: number
  aiEnabled: boolean
}
try {
  const res = await get(`${UI}/api/state`)
  if (!res.ok) die(`${UI}/api/state returned HTTP ${res.status}`)
  const text = await res.text()
  try {
    state = JSON.parse(text)
  } catch {
    die('the response was not JSON — is the roles UI server running?', text.slice(0, 200))
  }
} catch (e) {
  die(`could not reach ${UI}`, e)
}
for (const role of ['Issuer', 'Holder', 'Auditor']) {
  if (!Array.isArray(state.views?.[role]) || state.views[role].length === 0) {
    die(`the live ledger shows nothing for ${role} — bootstrap the stack first`)
  }
}
if (state.strangerVisibleHolds !== 0) {
  die(`stranger visibility is ${state.strangerVisibleHolds}, not 0 — the privacy claim would be false`)
}

// ── 2. the eval proof ─────────────────────────────────────────────────────
if (!existsSync(PROOF_PATH)) die(`no proof.json at ${PROOF_PATH} — run ./proof.sh`)
const proof = JSON.parse(readFileSync(PROOF_PATH, 'utf8')) as {
  generatedAt: string
  damlTests: { ok: number; failed: number }
  aiScreen: { pass: number; fail: number }
  mcpEval: { pass: number; fail: number }
  liveDemo: { pass: number; fail: number; ran: boolean }
}
const ageH = (Date.now() - new Date(proof.generatedAt).getTime()) / 3.6e6
if (ageH > MAX_AGE_HOURS) {
  die(`proof.json is ${ageH.toFixed(1)}h old (max ${MAX_AGE_HOURS}) — re-run ./proof.sh`)
}
for (const [name, s] of Object.entries(proof)) {
  if (name === 'generatedAt') continue
  const suite = s as { failed?: number; fail?: number }
  const fails = (suite.failed ?? 0) + (suite.fail ?? 0)
  if (fails !== 0) die(`proof.json reports ${fails} failures in ${name}`)
}
if (!proof.liveDemo.ran) die('proof.json: the live demo did not run — start the stack and re-run ./proof.sh')

// ── 3. bake ───────────────────────────────────────────────────────────────
const now = new Date()
const auditorView = state.views.Auditor
const trail = auditorView.filter(c => c.template === 'AuditEntry')
const payload = {
  // live stack, read at build time
  strangerSees: state.strangerVisibleHolds,
  aiEnabled: state.aiEnabled,
  auditorTrailEntries: trail.length,
  auditorTrailCauses: trail.filter(e => e.payload?.detail).length,
  issuerContracts: state.views.Issuer.length,
  readAt: now.toISOString(),
  readAtUnix: now.getTime(),
  // eval proof — same artifact the eval gate checks
  damlTestsOk: proof.damlTests.ok,
  aiScreenPass: proof.aiScreen.pass,
  mcpEvalPass: proof.mcpEval.pass,
  liveDemoPass: proof.liveDemo.pass,
  proofAt: proof.generatedAt,
}

writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n')
console.log(
  `  ok — live: stranger=${payload.strangerSees}, trail=${payload.auditorTrailEntries} entries; ` +
  `proof: ${payload.liveDemoPass} demo / ${payload.damlTestsOk} daml / ${payload.aiScreenPass} ai / ${payload.mcpEvalPass} mcp`,
)
console.log(`  wrote ${OUT.replace(HERE + '/', '')}  (proof from ${proof.generatedAt})`)
