#!/usr/bin/env bash
# deploy_site.sh — publish the built site to GitHub Pages via an orphan branch.
#
# Uses a THROWAWAY repo (per the skill's guidance) rather than the project repo,
# so the project history is never polluted with a ~20-file orphan commit that we
# would later have to force-push past.
#
# Verify, don't assume: the tripwire prints the staged file count and the tree is
# asserted free of node_modules/dist BEFORE the push.
set -euo pipefail

SITE_DIR=/root/holdwatch-site
WORK=/tmp/ghp-holdwatch-site
OWNER=HusseinAdeiza
REPO=holdwatch-site
TOKEN=$(cat /root/.config/git/secrets/hp_token)

cd "$SITE_DIR"

echo "── building ──"
npx vite build 2>&1 | tail -4

[[ -f dist/index.html ]] || { echo "FAIL: dist/index.html missing"; exit 1; }

echo
echo "── preparing throwaway Pages repo ──"
rm -rf "$WORK"
mkdir -p "$WORK"
# The worktree must contain ONLY the build output. Anything else (node_modules,
# source, .gitignore rules that hide build files) breaks the deploy.
cp -a dist/. "$WORK"/
# Pages runs Jekyll by default and strips underscore-prefixed dirs. Our asset
# dir is not underscore-prefixed, but this costs nothing and removes the class
# of bug entirely.
touch "$WORK/.nojekyll"

cd "$WORK"
git init -q
git config user.name "HusseinAdeiza"
git config user.email "husseinadeiza@users.noreply.github.com"

STAGED=$(git add -A --dry-run 2>/dev/null | wc -l)
echo "  files to stage: $STAGED"
if [ "$STAGED" -gt 200 ]; then
  echo "  FAIL: staged count implausible — ignore rules missing, aborting"
  exit 1
fi

git add -A
git commit -q -m "Deploy HoldWatch site to GitHub Pages"

echo
echo "── tripwire: no source trees in the commit ──"
BAD=$(git ls-tree -r --name-only HEAD | grep -cE "^(node_modules|src|dist|\.git)/" || true)
echo "  source paths in tree: $BAD"
[ "$BAD" -eq 0 ] || { echo "  FAIL: source present, aborting"; exit 1; }

echo
echo "── pushing gh-pages ──"
git push -f "https://x-access-token:$TOKEN@github.com/$OWNER/$REPO.git" \
  HEAD:gh-pages 2>&1 | tail -3

echo
echo "── enabling Pages ──"
CODE=$(curl -s -o /tmp/pages.json -w "%{http_code}" --max-time 30 \
  -X POST -H "Authorization: token $TOKEN" -H "User-Agent: hermes" \
  "https://api.github.com/repos/$OWNER/$REPO/pages" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}')
echo "  enable HTTP $CODE"
if [ "$CODE" != "201" ] && [ "$CODE" != "409" ] && [ "$CODE" != "422" ]; then
  head -c 300 /tmp/pages.json; echo
fi

echo
echo "URL: https://$OWNER.github.io/$REPO/"
