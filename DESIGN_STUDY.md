# Site design study — what the reference sites actually do

Two samples studied directly: **tryveir.xyz** and **vibeapps.dev/s/ourspaces**.
Recorded here as transferable rules, not vibes, because both sites earn attention
with specifics rather than styling.

---

## What tryveir.xyz gets right

**1. A live number in the first line, above the fold.**
> "**9** fully shielded payments in the last 10 blocks"

Not a claim about capability — a fact about *right now*, from the chain, that
changes if you reload. That single placement does more than a hero paragraph.

**2. The headline names a threat, not a benefit.**
> "Someone is _watching_"

Two words, and the reader's stake is the subject. Compare "Secure your payments
with our advanced privacy tools" — same product, no reason to care.

**3. Every number carries its provenance.**
- "30 / 35 / 9" with the caption *"Live from Zcash mainnet blocks 3,505,015–3,505,024"*
- "Live · mainnet block 3,505,024"
- "Faucet online · 0.9683 TAZ ready"

A visitor can check any of it. That is what separates this from a landing page
asserting trust.

**4. The problem is shown with a real artefact, not described.**
Three images of glass cubes at increasing frost, captioned *fully readable /
half-visible / fully shielded*. You understand the privacy problem by looking,
before reading a word.

**5. Concrete, asymmetric effort.**
- "Practice · simulated" → "about 8 min"
- "Testnet · recommended" → "about 10 min"
- "Investigate · real mainnet data" → "5 real cases"

Three different lengths, three different levels of commitment. Most sites offer a
single CTA. This one offers a ladder and tells you which rung to take.

**6. The FAQ answers what a nervous person actually asks.**
Recovery phrases ("write it on paper... never type it into a website, never
screenshot it"), fees to the decimal ("usually about 0.0001 ZEC"), and whether
the vendor can touch your money ("Never. Veir will never ask for your recovery
phrase").

**7. Bold set in italic, not weight.**
*"Someone is _watching_"* · *"Beginner to _mainnet-ready_"* · *"Zero to shielded in _six_ steps"*

Emphasis by italic gives a typographic register that bold cannot. It also keeps
the weight scale narrow, so headings stay readable instead of shouting.

---

## What vibeapps.dev/s/ourspaces gets right

**1. The whole pitch is one sentence, and it is a situation, not a feature.**
> "One page your whole group can mess with. Everyone's on it at the same time,
> and it has its own email address."

The third clause — *its own email address* — is the hook. It is strange enough
to be memorable and specific enough to be verifiable.

**2. A story with actual stakes, told in two sentences.**
> "Our friends live in a group chat and everything scrolls away. Twelve messages to
> pick a cake, and the receipt was gone by dinner."

**Twelve messages. Gone by dinner.** That is a real evening, not a persona.

**3. Numbers everywhere, including unflattering ones.**
> "13 tables · 45 queries + 72 mutations + 34 actions = 151 functions · 26 days"

The arithmetic is shown, not rounded. "Vibe coded in 26 days by Thomas Nguyen and
Holly Tran" credits two people rather than implying one hero.

**4. Try it with no account.**
> "Try it, no signup. Open the crew in two tabs and vote in one."

An instruction precise enough to act on in ten seconds. No "Get started."

**5. "Enjoy" as the closing word.**

---

## Rules to adopt, stated so they can be checked

| Rule | Test |
|---|---|
| Lead with a live number, not a claim | Is the first line a fact from the running system? |
| Headline names a threat or a situation | Would a reader who skipped the page still feel the stake? |
| Every number carries provenance | Block height, capture id, event id — something checkable |
| Show the problem with a real artefact | A payload, a screenshot, a trace — not a description |
| Offer a ladder, not one CTA | Do the options differ in cost and commitment? |
| Answer the anxious questions | What would stop someone from pressing the button? |
| Show arithmetic, including the ugly parts | Counts and totals, not rounded adjectives |
| Attribute honestly | Names, credits, and how long it took |
| Emphasis by italic, not weight | Narrow weight scale, legible headings |
| One instruction a stranger can act on | "Open in two tabs and vote in one" |

---

## What HoldWatch already satisfies

- Live numbers: **7 events · 7 verified · 19 types** — real, from the system
- Provenance: webhook id, capture id `6YH19408NM0071141`, event ids
- Arithmetic published: recall 0.20 → 0.80, precision 1.00, and the misses named
- Honest attribution of limits: the two-party create gap is documented, not hidden

## What HoldWatch still lacks

1. **The threat is not in the headline.** Ours describes a category, not a stake.
   Someone who loses money to an unexplained freeze does not yet feel it.
2. **No lead number above the fold.** The count is in a stat row, not the first
   line a reader meets.
3. **No artefact of the problem.** The strongest argument for this product is the
   raw webhook payload — a `ONHOLD` string and nothing else. We have it and do
   not show it.
4. **One CTA.** Practice/testnet/mainnet is a ladder; we have "View the build"
   and "Read the source" and nothing between.
5. **The FAQ does not exist**, and the anxious questions are real: *is my money
   gone? who sees this? what happens to my keys?*
6. **No worked example.** "Twelve messages to pick a cake" is the whole product in
   two sentences. Ours needs its equivalent.
