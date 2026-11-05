// douts.mjs <live-W.html> [rootSelector] [depth] [maxText] — outline of a live dump with data-r rects (JS off, no network)
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [file, root = 'main', depth = '4', maxText = '50', minH = '0'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ javaScriptEnabled: false })).newPage();
await p.route('**/*', r => r.abort());
await p.setContent('<body>' + fs.readFileSync(file, 'utf8') + '</body>', { waitUntil: 'domcontentloaded' });
console.log(await p.evaluate(([root, depth, maxText, minH]) => {
  const lines = [];
  const walk = (el, d) => {
    if (d > depth) return;
    const r = el.getAttribute('data-r') || ''; const h = +(r.split(',')[3] || 0);
    if (h < minH && d > 0) return;
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    lines.push('  '.repeat(d) + el.tagName.toLowerCase() + cls + ' [' + r + '] ' + (el.getAttribute('data-t') || '') + (own ? ' «' + own.slice(0, maxText) + '»' : ''));
    for (const c of el.children) walk(c, d + 1);
  };
  const r = document.querySelector(root); if (!r) return 'no root'; walk(r, 0); return lines.join('\n');
}, [root, +depth, +maxText, +minH]));
await b.close();
