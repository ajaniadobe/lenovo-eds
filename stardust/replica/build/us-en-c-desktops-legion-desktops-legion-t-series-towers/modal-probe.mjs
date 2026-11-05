// modal-probe.mjs <url> — find the timed marketing modal on the live page (selector for --dismiss)
import { chromium } from '/app/node_modules/playwright/index.mjs';
import { newLiveContext, gotoLive } from '../../../scripts/diff/live-session.mjs';
const b = await chromium.launch(); const ctx = await newLiveContext(b, { viewport: { width: +(process.argv[3] || 1440), height: 900 } }); const p = await ctx.newPage();
await gotoLive(p, process.argv[2]);
for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(1500); }
const r = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); const rc = e.getBoundingClientRect(); return (s.position === 'fixed') && rc.width > 200 && rc.height > 60 && s.display !== 'none' && s.visibility !== 'hidden'; }).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 120), z: getComputedStyle(e).zIndex, close: [...e.querySelectorAll('button,[role=button],a')].filter(x => /close|×|dismiss/i.test((x.getAttribute('aria-label') || '') + ' ' + x.className + ' ' + x.textContent.trim().slice(0, 3))).map(x => x.tagName + '#' + x.id + '.' + String(x.className).slice(0, 80) + ' aria=' + x.getAttribute('aria-label')).slice(0, 3) })));
console.log(JSON.stringify(r, null, 1)); await b.close();
