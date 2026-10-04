# Deploy the site to Render — step by step

**Takes about 2 minutes. You do not need to paste any API key or secret.**

The `render.yaml` in the repo does the configuration, so the form is already
pre-filled. You are just choosing a repository and pressing Apply.

---

## One thing left to fill in

**Blueprint Name** is blank and Render requires it. It must be unique across your
workspace, so it cannot be literally `holdwatch-site` — a service already owns
that name.

Type this:

```
holdwatch-site-v2
```

Any unused name works. It only labels the Blueprint; it does not affect the URL,
which will still be:

```
https://holdwatch-site.onrender.com
```

Then tap **Deploy Blueprint**.

---

## On your phone

**1. Open the Render dashboard**
`dashboard.render.com`

**2. Tap the "+ New" button** — top right, next to your workspace name.

**3. Choose "Blueprint"**

It may appear as **"New Blueprint Instance"**. That is the one you want — not
"Web Service", not "Static Site". Blueprint is what reads our `render.yaml`.

**4. Connect the repository**

You'll see a list of your GitHub repos with checkboxes. Tick:

```
✅  holdwatch-site
```

If you don't see it, tap **"Configure account"** or connect GitHub first.

**5. Tap "Apply"**

That's it. Render now:
- reads `render.yaml`
- runs `npm ci && npm run build`
- fetches the live numbers from `holdwatch-dashboard.onrender.com`
- publishes to `dist/`

**6. Watch the build**

You'll see **"Building…"** then **"Live"**. About 1–2 minutes. The log will
mention our data step:

```
reading live product: https://holdwatch-dashboard.onrender.com
ok — 7 events, 7 verified, 19 types, recall 0.8, 1 precision
```

**That line is the proof the site is real.** If the build fails there, the
dashboard is unreachable and we'd rather it fail than publish invented numbers.

---

## When it's live

Your URL will be:

```
https://holdwatch-site.onrender.com
```

Send it to me and I'll verify it serves properly, then update the links in the
README and on the Devpost submission.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| **Blueprint not offered** | You may need to click "Connect GitHub" first in Render's settings |
| **Build fails at `reading live product`** | The dashboard is down. Check `holdwatch-dashboard.onrender.com` loads |
| **`No valid render.yaml`** | Make sure you selected `holdwatch-site`, not `holdwatch` |
| **Asks for a repo you don't recognise** | You ticked the wrong checkbox — untick and pick only `holdwatch-site` |

**Do not paste any API keys or secrets.** This site needs none — every number on
it is read from the live deployment automatically at build time.

---

## One thing not to do

Don't retype the build command or the publish path. If Render shows them
pre-filled from `render.yaml`, leave them exactly as they are — they were tested
against a fresh clone of this repo.
