// wide.mjs <url> <width> — list elements whose right edge exceeds the viewport (outside scroll containers)
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [url, w] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
const r = await p.evaluate((w) => {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const rc = el.getBoundingClientRect();
    if (rc.right > w + 1 && rc.width > 0) { let a = el.parentElement, inScroll = false; while (a) { const s = getComputedStyle(a); if (/auto|scroll|hidden|clip/.test(s.overflowX) && a !== document.body) { inScroll = a.className; break; } a = a.parentElement; } out.push(String(inScroll).slice(0,30) + " :: " + el.tagName + '.' + [...el.classList].join('.') + ' r=' + Math.round(rc.right)); }
  }
  return [document.documentElement.scrollWidth, out.filter(s => s.startsWith("false")).slice(0, 15)];
}, +w);
console.log(JSON.stringify(r, null, 1)); await b.close();
