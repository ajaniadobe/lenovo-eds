// Locate text in the captured rendered HTML (JS off, no network): prints ancestor chain.
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [file, ...needles] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ javaScriptEnabled: false })).newPage();
await p.route('**/*', r => r.abort());
await p.setContent(fs.readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, ''), { waitUntil: 'domcontentloaded' });
console.log(await p.evaluate((needles) => needles.map(n => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) if (t.textContent.includes(n)) { const ch = []; let e = t.parentElement; while (e && e !== document.body) { ch.unshift(e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')); e = e.parentElement; } return n + ' :: ' + ch.join(' > '); }
  return n + ' :: NOT FOUND';
}).join('\n'), needles));
await b.close();
