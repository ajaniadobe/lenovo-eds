// live-dump.mjs <url> <outdir> <w[,w]> — one Chromium: open live (consent + email popup dismissed), settle,
// write live-<w>.html (serialised main + header + footer with data-r rects / data-t type) and live.css (all stylesheets).
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
import { openBrowser, openPage, visit, serializeInPage } from '../../../scripts/diff/measure-live.mjs';
const [url, out, widths = '1440'] = process.argv.slice(2);
const b = await openBrowser(chromium, { tier: 'plain' });
let cssDone = false;
for (const w of widths.split(',').map(Number)) {
  const { ctx, page } = await openPage(b, { width: w });
  const r = await visit(page, url);
  for (const sel of ['#_evh-ric-c', '.bluecoreCloseButton']) { try { await page.click(sel, { timeout: 1500 }); } catch {} }
  await page.waitForTimeout(800);
  const parts = [];
  for (const sel of ['main.main_content', 'body > div.page_body > div:first-of-type', 'div.page_body > div:last-of-type', '.sticky-bar']) {
    parts.push(`<!-- ${sel} -->\n` + (await page.evaluate(serializeInPage, { sel, budget: 3000000 }) || 'MISSING'));
  }
  fs.writeFileSync(`${out}/live-${w}.html`, `<!-- docH ${r.docH} sw ${await page.evaluate(() => document.documentElement.scrollWidth)} -->\n` + parts.join('\n'));
  if (!cssDone) {
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href));
    let css = await page.evaluate(() => [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n'));
    for (const h of hrefs) { try { const resp = await ctx.request.get(h); css += `\n/* ${h} */\n` + (await resp.text()); } catch {} }
    fs.writeFileSync(`${out}/live.css`, css); cssDone = true;
  }
  console.log('w', w, JSON.stringify(r));
  await ctx.close();
}
await b.close();
