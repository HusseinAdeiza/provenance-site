# holdwatch-site

Marketing and product site for **HoldWatch** — the PayPal payout-hold explainer
built for the PayPal AI Hackathon.

## Data is generated, not written

`src/data/product.generated.ts` is produced by:

```bash
python3 /root/web3alphatester/paypal/export_site_data.py
```

It reads the running product — `explainer.py`, `eval_report.json`, the captured
PayPal events, and the live capability probe — and emits a typed TS module. Every
figure the page renders (19 event types, recall 0.80, the 403 on Transaction
Search, the forged-event status) comes from there. **Regenerate after changing
the product, or the site becomes wrong.**

## Commands

```bash
npm install
npm run dev        # dev server
npm run typecheck  # tsc --noEmit, strict
npm run build      # typecheck + production bundle
npm run preview    # serve dist/
```

## Verification scripts

```bash
node scripts/render_responsive.mjs   # screenshots + overflow audit at 390/768/1440
node scripts/check_table_mobile.mjs  # proves the reference table scrolls, not the page
```

Both write to `.responsive/` (gitignored). `render_responsive.mjs` treats an
element inside a scroll container as intentional, so the wide reference table
does not register as a false overflow.

## Structure

```
src/
  components/
    primitives.tsx   Button, Panel, Metric, Chip, SeverityTag, StatusList, SectionHead
    Nav.tsx          sticky bar, scroll-aware
    Hero.tsx         headline + real captured event card
    Proof.tsx        metrics + live capability probe
    Bento.tsx        asymmetric grid + interactive guardrail inspector
    Walkthrough.tsx  6-step pipeline, AI step marked optional
    Explorer.tsx     filterable table, evaluation matrix, captured feed
    Cta.tsx          closing section
    Footer.tsx       directory + system status
  data/product.generated.ts   GENERATED — do not edit
  styles/tokens.css          design tokens, palette, contrast annotations
  styles/layout.css          section layout
```

Primitives are separate from section composition on purpose: keeping the split
strict is what stops the page collapsing into one large component.

## Design constraints honoured

- No gradients, glows, or glassmorphism. Warm paper ground, near-black ink, and
  four signal colours used **only** to encode severity.
- **WCAG AA verified, not assumed**: a sweep of all 368 text-bearing elements
  measures each against its own resolved background. `--text-faint` failed at
  3.07:1 and was darkened twice; the "Back to top" button was ink-on-ink at
  1.02:1 and is now `onInkGhost`.
- 8pt spacing grid, 1px borders with micro-shadows, tabular numerals on metrics,
  defined hover/active/focus-visible/disabled states.
- No placeholder copy: every string, metric and interaction reflects real
  product output.
