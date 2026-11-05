// Static outline of the captured rendered HTML (no network, JS off): tag.class tree under a root selector.
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [file, root = 'main', depth = '5', maxText = '60'] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ javaScriptEnabled: false });
const p = await ctx.newPage();
await p.route('**/*', r => r.abort());
await p.setContent(fs.readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, ''), { waitUntil: 'domcontentloaded' });
const out = await p.evaluate(([root, depth, maxText]) => {
  const lines = [];
  const walk = (el, d) => {
    if (d > depth) return;
    const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '';
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    const extra = el.tagName === 'IMG' ? ' src=' + (el.getAttribute('src') || el.getAttribute('data-src') || '').slice(0, 90) + ' alt="' + (el.alt || '') + '"' : el.tagName === 'A' ? ' href=' + (el.getAttribute('href') || '').slice(0, 90) : '';
    lines.push('  '.repeat(d) + el.tagName.toLowerCase() + cls + extra + (own ? ' «' + own.slice(0, maxText) + '»' : ''));
    for (const c of el.children) walk(c, d + 1);
  };
  const r = document.querySelector(root); if (!r) return 'no root';
  walk(r, 0); return lines.join('\n');
}, [root, +depth, +maxText]);
console.log(out);
await b.close();
