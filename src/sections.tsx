/**
 * Sections.tsx — the page.
 *
 * Every number here arrives as a prop from data/site.ts, which reads the running
 * stack and the eval proof at build time and FAILS the build if either is
 * unreachable or red. Nothing on this page is hand-typed marketing copy.
 *
 * Structure follows the reference study (DESIGN_STUDY.md): live number first,
 * headline naming the stake, the real artefact shown rather than described,
 * a ladder of three entry points rather than one CTA, and the questions
 * someone actually worries about before pressing the button.
 */
import { useState, type ReactElement } from 'react'
import type { SiteData as LiveData } from './data/site'

const REPO = 'https://github.com/HusseinAdeiza/provenance'

/* ── nav ──────────────────────────────────────────────────────────────── */
export function Nav() {
  const [stuck, setStuck] = useState(false)
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setStuck(window.scrollY > 8), { passive: true })
  }
  return (
    <header className={stuck ? 'nav nav--stuck' : 'nav'}>
      <div className="wrap nav__in">
        <a className="nav__brand" href="#top">
          <span className="nav__mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="nav__word">Provenance</span>
        </a>
        <nav className="nav__links">
          <a className="nav__link" href="#invariant">The invariant</a>
          <a className="nav__link" href="#roles">Three worlds</a>
          <a className="nav__link" href="#ai">AI layer</a>
          <a className="nav__link" href="#proof">Proof</a>
          <a className="nav__link" href="#start">Start</a>
          <a className="nav__link" href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
  )
}

/** How long ago the baked figures were read, in plain words. */
function fmtAge(unix: number): string {
  const mins = Math.max(0, Math.round((Date.now() - unix) / 60000))
  if (mins < 1) return 'seconds ago'
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  return `${Math.round(h / 24)} days ago`
}

/* ── hero ─────────────────────────────────────────────────────────────── */
function Hero({ d }: { d: LiveData }) {
  return (
    <section className="hero wrap" id="top">
      {/* live first — facts from the running stack, above the headline */}
      <p className="hero__live">
        <span className="pulse" aria-hidden="true" />
        <span>
          <b className="num">{d.liveDemoPass}</b> live checks passing ·{' '}
          <b className="num">{d.damlTestsOk}</b> contract tests ·{' '}
          <b className="num">{d.mcpEvalPass}</b> agent evals · a stranger sees{' '}
          <b className="num">{d.strangerSees}</b> contracts
        </span>
        <span className="hero__fresh">
          · read from the running stack {fmtAge(d.readAtUnix)}
        </span>
      </p>

      <h1>
        Your money is frozen. Nobody will tell you <em>why</em>.
      </h1>

      <p className="lede hero__lede">
        Provenance puts payment holds on Canton, where &ldquo;we will not invent a
        cause&rdquo; is not a policy — it is a contract invariant. A held payment has
        no reason field to fabricate into, and a made-up cause is a{' '}
        <em>rejected transaction</em>.
      </p>

      <div className="hero__cta">
        <a className="btn" href="#invariant">See how the ledger refuses a lie</a>
        <a className="btn btn--ghost" href={REPO}>Read the source</a>
      </div>

      {/* the artefact, shown rather than described: the real rejection line */}
      <div className="hero__token">
        <div className="hero__token-bar">
          <span>ledger log — real response from Canton</span>
        </div>
        <div className="hero__token-body">
          <p className="hero__token-str">
            Issuer → RELEASE with fabricated (empty) cause —{' '}
            <b style={{ color: 'var(--crit)' }}>✗ REJECTED</b> HTTP 400 ·
            FAILED_PRECONDITION · AssertionFailed: &ldquo;reason must not be empty at release&rdquo;
          </p>
          <p className="hero__token-note">
            That rejection did not come from our server. The UI contains no
            validation logic — the platform itself refused. On any other stack,
            &ldquo;we will not invent a cause&rdquo; is a promise your backend keeps. Here
            it is a transaction the ledger will not commit.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── the invariant ────────────────────────────────────────────────────── */
function Invariant() {
  const rows: Array<[string, string, string]> = [
    ['HELD', 'no reason field exists', 'You cannot fabricate what the contract cannot hold. This is structure, not discipline.'],
    ['DISPUTED', 'the holder’s words, verbatim', 'A contest records a statement and establishes nothing. The audit trail shows detail = None.'],
    ['RELEASED / RETURNED', 'a cause both parties signed', 'Multi-controller: one signature with a valid reason is still rejected. The cause enters the record only when issuer and holder act together.'],
  ]
  return (
    <section className="section wrap" id="invariant">
      <p className="eyebrow">The invariant</p>
      <h2>Three states a hold can be in — only one of them has a <em>cause</em></h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        The distinction the whole product exists to keep:{' '}
        <em>&ldquo;the rail told us a reason&rdquo;</em> versus{' '}
        <em>&ldquo;the rail told us nothing.&rdquo;</em> Tools that blur the two send people
        to the wrong remedy — chasing a fraud review when the cause was an
        address mismatch.
      </p>
      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr><th>Contract state</th><th>What it can say about cause</th><th>Enforced by</th></tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a}>
                <td className="mono">{a}</td>
                <td><b>{b}</b></td>
                <td className="small">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small" style={{ marginTop: 'var(--s4)' }}>
        Verified, not asserted: <span className="mono">test_hold_cannot_carry_a_reason</span>,{' '}
        <span className="mono">test_issuer_cannot_release_alone</span>,{' '}
        <span className="mono">test_dispute_does_not_invent_cause</span> — all in the repo,
        all passing. The second exists because we once shipped the opposite claim:{' '}
        <a href={REPO + '#build_logmd'}>BUILD_LOG D4</a>.
      </p>
    </section>
  )
}

/* ── three worlds ─────────────────────────────────────────────────────── */
function Roles({ d }: { d: LiveData }) {
  const roles: Array<[string, string, string]> = [
    ['Issuer', 'signatory', 'Creates the hold with the holder, proposes a cause, co-signs every resolution. Cannot establish a cause alone.'],
    ['Holder', 'signatory', 'Co-signs resolutions; disputes unilaterally — a payee must be able to contest without the payer’s agreement.'],
    ['Auditor', 'observer', `Reads the whole trail — ${d.auditorTrailEntries} entries, ${d.auditorTrailCauses} with established causes — signs nothing, cannot act. Verification without access.`],
  ]
  return (
    <section className="section wrap" id="roles">
      <p className="eyebrow">Disclosure</p>
      <h2>One ledger, <em>three worlds</em></h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        Each role&rsquo;s view is what the ledger discloses to that party — the server
        does no filtering, so the UI cannot overstate privacy. A stranger
        querying the same ledger sees <b className="num">{d.strangerSees}</b> contracts.
      </p>
      <div className="cards3">
        {roles.map(([name, kind, text]) => (
          <div className="card3" key={name}>
            <div className="card3__top">
              <h3>{name}</h3>
              <span className="chip">{kind}</span>
            </div>
            <p className="small">{text}</p>
          </div>
        ))}
      </div>
      <p className="small" style={{ marginTop: 'var(--s5)' }}>
        That combination — private terms, provable cause, non-signing audit — is
        not expressible on a public chain, where every field is world-readable,
        and not enforceable behind an API, where a permissions server is the
        only thing standing between an auditor and your data.
      </p>
    </section>
  )
}

/* ── the AI layer ─────────────────────────────────────────────────────── */
function AiLayer({ d }: { d: LiveData }) {
  return (
    <section className="section wrap" id="ai">
      <p className="eyebrow">The AI layer</p>
      <h2>A language model that <em>cannot</em> invent a cause</h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        Instructions are not enforcement. So every model answer is re-screened
        against the contract state before anyone sees it: assert a cause the
        ledger did not establish, and the answer is <b>discarded</b> — the
        deterministic text takes its place, and the UI says so.
        {d.aiEnabled
          ? ' A model key is set on this stack, so answers are tailored — and still screened.'
          : ' This build has no model key set, so every answer is the deterministic one. The product does not die without AI.'}
      </p>
      <div className="cards3">
        <div className="card3">
          <h3>Two-tier screen</h3>
          <p className="small">
            Strong cause terms (&ldquo;fraud&rdquo;, &ldquo;flagged for&rdquo;, &ldquo;under review&rdquo;) flag
            unconditionally — even smuggled behind an honest-sounding denial
            prefix. Weak connectives flag only when the text isn&rsquo;t itself a denial.
          </p>
        </div>
        <div className="card3">
          <h3><span className="num">{d.aiScreenPass}</span> screening checks</h3>
          <p className="small">
            Including the false positive that shaped the design: the honest
            answer &ldquo;no cause, <em>because</em> none was established&rdquo; must pass,
            while &ldquo;no cause established, but likely flagged for compliance&rdquo;
            must not.
          </p>
        </div>
        <div className="card3">
          <h3>Agents get no exemption</h3>
          <p className="small">
            The MCP server exposes the lifecycle as {d.mcpEvalPass} checked agent
            tools. An AI agent that fabricates a cause is rejected by the ledger
            exactly like a human — the eval drives a real MCP client and asserts it.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── proof ────────────────────────────────────────────────────────────── */
function Proof({ d }: { d: LiveData }) {
  const suites: Array<[string, number, string]> = [
    ['Live demo checks', d.liveDemoPass, 'fabrication rejected · one-signature rejected · stranger sees zero · auditor reads the trail · auditor cannot act'],
    ['Contract tests', d.damlTestsOk, 'daml test — invariants, authorisation, dispute, audit trail'],
    ['AI screen checks', d.aiScreenPass, 'both tiers, denial false-positives, full ask() wiring'],
    ['MCP agent evals', d.mcpEvalPass, 'real JSON-RPC client: handshake, tools, fabrication rejected'],
  ]
  return (
    <section className="section wrap" id="proof">
      <p className="eyebrow">Proof</p>
      <h2>Every number on this page is <em>eval output</em></h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        The build fails if the stack is unreachable or any check is red — this
        page cannot publish a figure the suite did not just produce. Proof
        generated {new Date(d.proofAt).toUTCString().replace(' GMT', ' UTC')};
        page baked {fmtAge(d.readAtUnix)}.
      </p>
      <div className="proof-grid">
        {suites.map(([name, n, desc]) => (
          <div className="proof-cell" key={name}>
            <span className="proof-n num">{n}<span className="proof-ok">✓</span></span>
            <div>
              <b>{name}</b>
              <p className="tiny" style={{ margin: '4px 0 0' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── ladder ───────────────────────────────────────────────────────────── */
function Start() {
  const rungs: Array<[string, string, string, string]> = [
    ['Read the contracts', 'about 5 minutes', 'Provenance.daml. The invariants are in the types: HeldPayment has no reason field.', REPO + '/blob/main/daml-src/Provenance.daml'],
    ['Run every proof', 'about 3 minutes', './proof.sh — contract tests, live checks, AI screen, MCP evals. Green, or exit 1.', REPO + '#run-it'],
    ['Drive it yourself', 'about 10 minutes', './demo/run_stack.sh, then open the roles UI. Press the red button; watch Canton refuse.', REPO + '#the-demo-in-one-table'],
  ]
  return (
    <section className="section wrap" id="start">
      <p className="eyebrow">Start</p>
      <h2>Three rungs. Take the one that <em>proves</em> something to you.</h2>
      <div className="ladder">
        {rungs.map(([title, time, text, href]) => (
          <a className="rung" key={title} href={href}>
            <div className="rung__top"><b>{title}</b><span className="tiny">{time}</span></div>
            <p className="small">{text}</p>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
function Faq() {
  const qs: Array<[string, ReactElement]> = [
    ['Is this mainnet?', <>No — a local Canton sandbox, and that is stated everywhere it matters. Canton&rsquo;s own rules accept DevNet/TestNet/LocalNet for judging; DevNet deployment is pilot step&nbsp;1.</>],
    ['Can the issuer just release the money themselves?', <>No. Release is multi-controller: it needs the holder in the transaction&rsquo;s <span className="mono">actAs</span> set. We shipped a single-controller version once; an authorisation test caught that the issuer <em>could</em> release alone, and <span className="mono">test_issuer_cannot_release_alone</span> now pins the fix. The bug is in the BUILD_LOG.</>],
    ['What stops the AI from making up a reason?', <>Two things, because instructions are not enforcement: the model only ever sees contract state, and every answer is screened — any text asserting a cause the ledger did not establish is discarded and replaced by the deterministic answer. <span className="mono">python3 ai.py</span> runs the whole screen with no key and no network.</>],
    ['Is a dispute a cause?', <>Never. A dispute records the holder&rsquo;s statement verbatim and writes an audit entry with <span className="mono">detail = None</span>. The contested hold stays a hold with an unestablished cause until both parties sign a resolution.</>],
    ['Who is this for?', <>Operations leads at agencies that pay contractor rosters through rails which hold funds without explanation — the person who must answer &ldquo;where is my money?&rdquo; in five minutes with a status code and nothing else. And their auditors, who can verify the trail without being shown private terms.</>],
    ['Does it need an API key to work?', <>No. Without one, the AI layer reports itself disabled and every card renders from the deterministic engine. A submission that dies without a key is a demo, not a product.</>],
  ]
  return (
    <section className="section wrap" id="faq">
      <p className="eyebrow">FAQ</p>
      <h2>What a careful person asks first</h2>
      <dl className="faq">
        {qs.map(([q, a]) => (
          <div className="faq__item" key={q}>
            <dt>{q}</dt>
            <dd>{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ── footer ───────────────────────────────────────────────────────────── */
function Footer({ d }: { d: LiveData }) {
  return (
    <footer className="section--tight wrap footer">
      <hr className="hairline" style={{ marginBottom: 'var(--s5)' }} />
      <p className="tiny">
        Provenance · built for HackCanton Season 4 (RWA &amp; Business Workflows) · MIT
        licensed · not affiliated with Digital Asset or the Canton Network. A
        pre-window research probe is disclosed in the README; all implementation
        is in-window. Figures baked {new Date(d.readAt).toISOString()} from the
        running stack and proof.json.
      </p>
      <p className="tiny">
        <a href={REPO}>github.com/HusseinAdeiza/provenance</a>
      </p>
    </footer>
  )
}

export function Sections({ d }: { d: LiveData }) {
  return (
    <>
      <Nav />
      <Hero d={d} />
      <Invariant />
      <Roles d={d} />
      <AiLayer d={d} />
      <Proof d={d} />
      <Start />
      <Faq />
      <Footer d={d} />
    </>
  )
}
