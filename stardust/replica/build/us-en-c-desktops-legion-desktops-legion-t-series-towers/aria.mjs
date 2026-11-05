// aria.mjs — aria-labelled elements under the DLP + hero in the captured HTML (JS off)
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const S = 'us-en-c-desktops-legion-desktops-legion-t-series-towers';
const root = new URL('../../../', import.meta.url).pathname;
const b = await chromium.launch(); const ctx = await b.newContext({ javaScriptEnabled: false }); const p = await ctx.newPage();
await p.route('**/*', r => r.abort());
await p.setContent(fs.readFileSync(root + `current/pages/${S}.html`, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, ''), { waitUntil: 'domcontentloaded' });
const r = await p.evaluate(() => [...document.querySelectorAll('main [aria-label]')].filter(e => !e.closest('li.product_item:not(:first-child)')).map(e => `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join('.')} [${e.getAttribute('aria-label')}]${e.getAttribute('role') ? ' role=' + e.getAttribute('role') : ''}${e.getAttribute('tabindex') ? ' ti=' + e.getAttribute('tabindex') : ''} «${e.textContent.trim().slice(0, 40)}» parent=${e.parentElement.className.slice(0, 40)}`));
console.log(r.join('\n'));
const pop = await p.evaluate(() => document.querySelector('li.product_item .le-popover').outerHTML.replace(/<!---->/g, ''));
console.log(pop);
await b.close();
