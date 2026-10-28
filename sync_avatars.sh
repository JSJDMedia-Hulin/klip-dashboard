#!/usr/bin/env bash
# Re-scrapes the published Klipfolio dashboard for rep photos and commits any new/changed ones
# to main of JSJDMedia-Hulin/klip-dashboard (avatars/*.png + avatars.json). Not scheduled.
# Usage: sync_avatars.sh [--no-push]
# Reps seen before are kept even when they're not on Klipfolio right now. Exits nonzero on failure.
set -euo pipefail
HERE=/workspace/klip/standalone
CLONE=/workspace/klip/main-clone        # deploy-only clone of main (reset to origin/main each run)
REMOTE=https://github.com/JSJDMedia-Hulin/klip-dashboard.git
PUSH=1; [ "${1:-}" = "--no-push" ] && PUSH=0
PAIRS=$(mktemp); trap 'rm -f "$PAIRS"' EXIT
node "$HERE/sync_avatars.js" > "$PAIRS"
if [ ! -d "$CLONE/.git" ]; then rm -rf "$CLONE"; git clone -q -b main "$REMOTE" "$CLONE"; fi
cd "$CLONE"; git fetch -q origin main; git reset -q --hard origin/main
python3 - "$PAIRS" "$CLONE" <<'PY'
import json, sys, os, re, hashlib, io, urllib.request
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True   # some source PNGs have a bad eXIf CRC; browsers ignore it
pairs = json.load(open(sys.argv[1])); root = sys.argv[2]
os.makedirs(os.path.join(root, "avatars"), exist_ok=True)
mp, sp = os.path.join(root, "avatars.json"), os.path.join(root, "avatars", "sources.json")
amap = json.load(open(mp)) if os.path.exists(mp) else {}
src = json.load(open(sp)) if os.path.exists(sp) else {}
slug = lambda n: re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-")
changed = []
for name, url in sorted(pairs.items()):
    data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()
    sh = hashlib.sha1(data).hexdigest()
    if src.get(name, {}).get("sha1") == sh and name in amap: continue
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    bb = im.getchannel("A").getbbox()
    if bb: im = im.crop(bb)
    w, h = im.size; s = min(w, h)
    box = ((w - s) // 2, 0, (w - s) // 2 + s, s) if h > w else ((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)
    im = im.crop(box).resize((160, 160), Image.LANCZOS)
    fn = "avatars/%s.png" % slug(name); out = os.path.join(root, fn)
    im.save(out, optimize=True)
    oh = hashlib.sha1(open(out, "rb").read()).hexdigest()[:10]
    amap[name] = "%s?h=%s" % (fn, oh); src[name] = {"url": url, "sha1": sh}
    changed.append(name)
json.dump(dict(sorted(amap.items())), open(mp, "w"), indent=1); open(mp, "a").write("\n")
json.dump(dict(sorted(src.items())), open(sp, "w"), indent=1); open(sp, "a").write("\n")
print("updated: " + (", ".join(changed) if changed else "none") + " | total reps with photos: %d" % len(amap))
PY
cp -r "$CLONE/avatars" "$CLONE/avatars.json" "$HERE/"
git add avatars avatars.json
if git diff --cached --quiet; then echo "no change"; exit 0; fi
git -c user.name=JSJDMedia-Hulin -c user.email=JSJDMedia-Hulin@users.noreply.github.com commit -qm "Sync rep avatars from Klipfolio $(date '+%Y-%m-%d %H:%M %Z')"
if [ "$PUSH" = 1 ]; then git push -q origin HEAD:main; echo "pushed $(git rev-parse --short HEAD)"; else echo "committed locally (not pushed)"; fi
