#!/usr/bin/env bash
# Structural probes, one instrument at a time (machine limit: ≤3 Chromiums).
S=us-en-p-laptops-legion-laptops-legion-pro-series-legion-pro-5i-gen-10-16-inch-intel-83f300bbus
LIVE="https://www.lenovo.com/us/en/p/laptops/legion-laptops/legion-pro-series/legion-pro-5i-gen-10-16-inch-intel/83f300bbus"
PROTO="http://localhost:8791/$S-proposed.html"
for W in ${WIDTHS:-1440 360}; do
  G=stardust/replica/gates/$S-$W
  node stardust/scripts/diff/content-diff.mjs "$LIVE" "$PROTO" --profile generic --main main.main_content --width $W --dismiss '#_evh-ric-c,.bluecoreCloseButton' > $G/content-diff.txt 2>&1; echo "content-diff $W rc=$?"; sed -n 16,17p $G/content-diff.txt
  [ -n "$ONLY_CD" ] && continue
  node stardust/scripts/diff/clip-probe.mjs "$PROTO" --width $W --main main.main_content --json $G/clip.json > $G/clip.txt 2>&1; echo "clip $W rc=$?"; tail -3 $G/clip.txt
  node stardust/scripts/diff/content-presence.mjs "$LIVE" "$PROTO" --width $W --main main.main_content --json $G/presence.json > $G/presence.txt 2>&1; echo "presence $W rc=$?"; tail -6 $G/presence.txt
done
