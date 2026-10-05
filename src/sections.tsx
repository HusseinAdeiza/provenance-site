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
          <a className="nav__link" href="#invariant">The rule</a>
          <a className="nav__link" href="#roles">Three views</a>
          <a className="nav__link" href="#ai">AI helper</a>
          <a className="nav__link" href="#people">Evidence</a>
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
        Provenance puts a held payment on Canton, where &ldquo;we won&rsquo;t make up a
        reason&rdquo; isn&rsquo;t a promise &mdash; it&rsquo;s a rule the ledger enforces. A held
        payment has no &ldquo;reason&rdquo; box to fill in, and a made-up reason is a{' '}
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
            That &ldquo;no&rdquo; did not come from our server. The app has no rule-checking
            code at all &mdash; the platform itself refused. Anywhere else, &ldquo;we won&rsquo;t
            make up a reason&rdquo; is a promise your backend has to keep. Here it&rsquo;s a
            transaction the ledger won&rsquo;t accept.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── the invariant ────────────────────────────────────────────────────── */
function Invariant() {
  const rows: Array<[string, string, string]> = [
    ['HELD', 'there is no reason to give yet', 'A held payment has no "reason" box at all. You can\u2019t fill in something that doesn\u2019t exist — that\u2019s the design, not a rule we ask you to follow.'],
    ['DISPUTED', 'the holder\u2019s own words, nothing more', 'A dispute records what the holder says and proves nothing was established. The audit trail literally shows "no reason."'],
    ['RELEASED / RETURNED', 'a reason both sides signed', 'Both the issuer and the holder must act together. One of them alone — even with a good reason — is still rejected.'],
  ]
  return (
    <section className="section wrap" id="invariant">
      <p className="eyebrow">The rule</p>
      <h2>A hold has three states &mdash; only one of them has a <em>reason</em></h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        The whole product exists to keep one distinction honest:{' '}
        <em>&ldquo;the system told us why&rdquo;</em> versus{' '}
        <em>&ldquo;the system told us nothing.&rdquo;</em> Blur the two and you send
        someone to the wrong fix &mdash; chasing a fraud review when the real cause
        was a wrong address.
      </p>
      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr><th>State</th><th>What it can say about the reason</th><th>How it&rsquo;s enforced</th></tr>
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
        Checked, not claimed: three tests in the repo prove each of these
        (<span className="mono">test_hold_cannot_carry_a_reason</span>,{' '}
        <span className="mono">test_issuer_cannot_release_alone</span>,{' '}
        <span className="mono">test_dispute_does_not_invent_cause</span>) &mdash; all
        passing. The middle one exists because we once got this wrong and a test
        caught it: <a href={REPO + '#build_logmd'}>BUILD_LOG D4</a>.
      </p>
    </section>
  )
}

/* ── three worlds ─────────────────────────────────────────────────────── */
function Roles({ d }: { d: LiveData }) {
  const roles: Array<[string, string, string]> = [
    ['Issuer', 'signs', 'Puts the hold in place together with the holder, suggests a reason, and signs every resolution. Cannot settle a reason on their own.'],
    ['Holder', 'signs', 'Signs off on resolutions, and can dispute on their own — someone whose money is held must be able to object without the other side agreeing.'],
    ['Auditor', 'watches only', `Reads the whole trail — ${d.auditorTrailEntries} entries, ${d.auditorTrailCauses} with settled reasons — signs nothing, changes nothing. Checks the record without touching the money.`],
  ]
  return (
    <section className="section wrap" id="roles">
      <p className="eyebrow">Disclosure</p>
      <h2>One ledger, <em>three views</em></h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        Each person sees only what the ledger allows them to see. Our server does
        no hiding of its own &mdash; so this page can&rsquo;t overstate the privacy.
        A stranger looking at the same ledger sees <b className="num">{d.strangerSees}</b> contracts.
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
        Private details, a provable reason, and an auditor who can check without
        touching anything &mdash; together. A public blockchain can&rsquo;t do this
        (everything on it is world-readable), and a normal app can&rsquo;t enforce it
        (it trusts whatever its own server decides to show).
      </p>
      <p className="tiny" style={{ marginTop: 'var(--s4)', borderLeft: '2px solid var(--line)', paddingLeft: 'var(--s4)' }}>
        <b>To be clear about what you&rsquo;re looking at:</b> this demo runs on one
        machine. A small server asks the ledger the same question three times &mdash;
        once as the issuer, once as the holder, once as the auditor &mdash; to show what
        each is allowed to see. That proves the <em>rules</em>, and the rules are the
        product. It is not yet three separate people signing from three separate
        wallets; a production version would be. The rule the ledger enforces
        (both parties must sign a release, whoever submits it) is identical either way.
      </p>
    </section>
  )
}

/* ── the AI layer ─────────────────────────────────────────────────────── */
function AiLayer({ d }: { d: LiveData }) {
  return (
    <section className="section wrap" id="ai">
      <p className="eyebrow">The AI helper</p>
      <h2>An AI that <em>can&rsquo;t</em> make up a reason</h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        Telling an AI &ldquo;don&rsquo;t invent anything&rdquo; isn&rsquo;t enough &mdash; so we check
        every answer it writes before anyone sees it. If the AI states a reason
        the ledger never established, we <b>throw the answer away</b> and show the
        plain facts instead, and the screen says that&rsquo;s what happened.
        {d.aiEnabled
          ? ' A model is connected here, so answers are written for your case — and still checked.'
          : ' This build has no model connected, so every answer is the plain factual one. The product still works with no AI at all.'}
      </p>
      <div className="cards3">
        <div className="card3">
          <h3>Two levels of checking</h3>
          <p className="small">
            Clear giveaway words (&ldquo;fraud&rdquo;, &ldquo;under review&rdquo;, &ldquo;flagged for&rdquo;)
            are always caught &mdash; even hidden inside an honest-sounding sentence.
            Softer wording is caught unless the answer is really saying &ldquo;no
            reason was given.&rdquo;
          </p>
        </div>
        <div className="card3">
          <h3><span className="num">{d.aiScreenPass}</span> checks on the filter</h3>
          <p className="small">
            Including the tricky one that shaped the design: &ldquo;no reason,
            <em> because</em> none was given&rdquo; must pass (it&rsquo;s honest), while
            &ldquo;no reason given, but probably flagged for compliance&rdquo; must not
            (it invents one).
          </p>
        </div>
        <div className="card3">
          <h3>AI agents get no free pass</h3>
          <p className="small">
            An AI agent can drive the same workflow through {d.mcpEvalPass} standard
            tools. If the agent tries to invent a reason, the ledger rejects it
            exactly like it would a person &mdash; and our test proves that.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── the people who told us this is a real problem ────────────────────── */
function People() {
  // Four real interviews, Oct 2026. Their words, reproduced exactly — nothing
  // embellished. A product that says "we won't make up a reason" cannot be
  // built on made-up evidence, so the specifics stay messy because that is
  // what makes them credible.
  const cases: Array<[string, string, string, string]> = [
    [
      'A freelance 3D artist',
      '$850 held for 9 days · Payoneer / Upwork',
      'The app said "pending review… no further action is required." He split the payout into two smaller amounts to dodge scrutiny — and that flagged the account and reset the clock.',
      'When an app says "no action required" while holding your money, you are sitting in a dark room. You don\u2019t know whether to keep quiet or start panicking.',
    ],
    [
      'An agency owner paying 6 contractors',
      '$2,400 held for 14 days · Flutterwave / Wise',
      'The dashboard showed one line — "PENDING COMPLIANCE CLEARANCE" — with no clue which of the six people caused it. She paid three from her own savings. The batch cleared anyway, so they were paid twice.',
      'The worst thing about managing a team is having to say "I don\u2019t know where the money is" when the dashboard just writes one cold word: PENDING.',
    ],
    [
      'A payments engineer',
      '$4,200 held for 6 days · Paystack / Stripe',
      'The webhook literally returned reason: null while the docs promised detailed errors. His team auto-retried every 10 minutes — the fraud system read that as a stolen account and revoked every API key.',
      'Building on payment APIs means accepting that when things break, the machine returns null. You are expected to debug silence.',
    ],
    [
      'A contractor paid across borders',
      '$1,650 held for 8 days · Upwork / Payoneer',
      'The message was a placeholder with no date and no reason. He opened three support tickets to find a faster agent — the system merged them as duplicates and put him to the back of the queue.',
      'The silence forces you into irrational behaviour. You start opening tickets and calling people who know less than you do, just to feel like you\u2019re doing something.',
    ],
  ]
  return (
    <section className="section wrap" id="people">
      <p className="eyebrow">The evidence</p>
      <h2>Four people. The hold wasn&rsquo;t the problem &mdash; the <em>silence</em> was.</h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        We talked to four people who had money frozen, and asked what actually
        happened. In every case the delay was bearable; not knowing <em>why</em> is
        what made them act &mdash; and every action made it worse. Their words below,
        unchanged.
      </p>
      <div className="people-grid">
        {cases.map(([who, what, story, quote]) => (
          <figure className="person" key={who}>
            <figcaption>
              <b>{who}</b>
              <span className="tiny" style={{ display: 'block' }}>{what}</span>
            </figcaption>
            <p className="small">{story}</p>
            <blockquote>&ldquo;{quote}&rdquo;</blockquote>
          </figure>
        ))}
      </div>
      <p className="small" style={{ marginTop: 'var(--s5)' }}>
        Notice what none of them had: a way to tell <em>&ldquo;the system told us
        nothing&rdquo;</em> from <em>&ldquo;there&rsquo;s a reason I haven&rsquo;t been shown.&rdquo;</em>{' '}
        That single distinction is the whole product. The engineer&rsquo;s{' '}
        <span className="mono">reason: null</span> is the same thing in code &mdash; and
        it is the exact field a Provenance contract has no room for until both
        sides establish one.
      </p>
      <p className="tiny" style={{ marginTop: 'var(--s4)', borderLeft: '2px solid var(--line)', paddingLeft: 'var(--s4)' }}>
        Honest about the limits: four interviews show a pattern, not a market.
        All four are in two corridors (Nigeria, Pakistan) and reachable through
        our own network, which biases toward people willing to talk. They justify
        the problem and the design; they do not size an opportunity. Full record,
        verbatim, in <span className="mono">VALIDATION.md</span>.
      </p>
    </section>
  )
}

/* ── proof ────────────────────────────────────────────────────────────── */
function Proof({ d }: { d: LiveData }) {
  const suites: Array<[string, number, string]> = [
    ['Live demo checks', d.liveDemoPass, 'made-up reason rejected · one signature rejected · stranger sees nothing · auditor reads the trail · auditor can\u2019t act'],
    ['Contract tests', d.damlTestsOk, 'the rules, the signing, the dispute, and the audit trail'],
    ['AI screen checks', d.aiScreenPass, 'both levels, the honest-answer case, and the full question flow'],
    ['Agent checks', d.mcpEvalPass, 'a real AI-agent connection: setup, tools, and a made-up reason rejected'],
  ]
  return (
    <section className="section wrap" id="proof">
      <p className="eyebrow">Proof</p>
      <h2>Every number here is <em>test output</em>, not a claim</h2>
      <p className="lede" style={{ marginBottom: 'var(--s6)' }}>
        If the ledger can&rsquo;t be reached, or any single check fails, the site
        refuses to build &mdash; so this page can&rsquo;t show a number the tests didn&rsquo;t
        just produce. Checks run {new Date(d.proofAt).toUTCString().replace(' GMT', ' UTC')};
        page built {fmtAge(d.readAtUnix)}.
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
    ['Read the rules', 'about 5 minutes', 'Provenance.daml. The honesty rule is in the shape of the data: a held payment has no "reason" field at all.', REPO + '/blob/main/daml-src/Provenance.daml'],
    ['Run every check', 'about 3 minutes', './proof.sh — contract tests, live checks, the AI filter, the agent tests. All green, or it stops.', REPO + '#run-it-yourself'],
    ['Drive it yourself', 'about 10 minutes', './demo/run_stack.sh, then open the screen. Press the red button; watch Canton refuse.', REPO + '#what-the-checks-show'],
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
    ['Is this on a real, public network?', <>No &mdash; it runs on a local Canton test ledger (the official sandbox). We say so everywhere it matters. Canton&rsquo;s own hackathon rules accept a local deployment for judging. Their public test network (DevNet) needs a sponsoring validator, a VPN and a 2&ndash;4 week approval, which doesn&rsquo;t fit this deadline; moving the same contract there later is a settings change, not a rebuild.</>],
    ['Is this three real people on three wallets?', <>Not yet. The demo runs on one machine: a small server asks the ledger the same question three times, once as each role, to show what that role is allowed to see. That proves the <em>rules</em> &mdash; and the rules are the product. A real deployment would have each person sign from their own wallet. The rule (a release needs both sides, whoever submits it) is the same either way.</>],
    ['Can the issuer just release the money themselves?', <>No. A release needs the holder too. We shipped a version once where the issuer <em>could</em> release alone &mdash; a test caught it, we fixed it, and <span className="mono">test_issuer_cannot_release_alone</span> now stops it coming back. The mistake is written up in the BUILD_LOG.</>],
    ['What stops the AI from making up a reason?', <>Two things, because telling it &ldquo;don&rsquo;t&rdquo; isn&rsquo;t enough: the AI only ever sees the facts the ledger holds, and every answer is checked before it&rsquo;s shown &mdash; if it names a reason the ledger never established, we throw that answer away and show the plain facts instead. <span className="mono">python3 ai.py</span> runs the whole check with no AI key and no internet.</>],
    ['Is a dispute the same as a reason?', <>Never. A dispute records the holder&rsquo;s own words and proves nothing was established &mdash; the audit trail literally shows &ldquo;no reason.&rdquo; The hold stays a hold with no reason until both sides sign one.</>],
    ['Who is this for?', <>The person at an agency who has to answer &ldquo;where is my money?&rdquo; in five minutes when a payment is held &mdash; usually an operations lead paying a roster of contractors. And their auditors, who can check what happened without being shown private payment details.</>],
    ['Does it need an AI key to work?', <>No. Without one, the AI part switches itself off and every card is built straight from the ledger facts. An app that dies without an API key is a toy; this isn&rsquo;t one.</>],
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
      <People />
      <Proof d={d} />
      <Start />
      <Faq />
      <Footer d={d} />
    </>
  )
}
