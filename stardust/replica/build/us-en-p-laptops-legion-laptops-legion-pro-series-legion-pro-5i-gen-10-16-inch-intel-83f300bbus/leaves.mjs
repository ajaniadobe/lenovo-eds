// leaves.mjs <live-W.html> <rootSel> [--all] — compact leaf list (text blocks, imgs, links, videos, bg-images) per root match, from a live dump
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [file, root, all] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ javaScriptEnabled: false })).newPage();
await p.route('**/*', r => r.abort());
await p.setContent('<body>' + fs.readFileSync(file, 'utf8') + '</body>', { waitUntil: 'domcontentloaded' });
console.log(await p.evaluate(([root, all]) => {
  const roots = all ? [...document.querySelectorAll(root)] : [document.querySelector(root)];
  return roots.map((r, i) => {
    const out = [`#${i} ${r.className} [${r.getAttribute('data-r')}]`];
    const walk = (el) => {
      const r2 = el.getAttribute('data-r') || ''; const [x, y, w, h] = r2.split(',').map(Number);
      const tag = el.tagName.toLowerCase(); const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/)[0] || '';
      const st = el.getAttribute('style') || ''; const bg = st.match(/background-image:\s*url\(([^)]*)\)/);
      if (bg && w > 0) out.push(`  BG ${cls} [${r2}] ${bg[1].replace(/["']/g, '').slice(0, 140)}`);
      if (tag === 'img') { if (w > 0) out.push(`  IMG ${cls} [${r2}] ${(el.getAttribute('src') || '').slice(0, 150)} alt="${(el.getAttribute('alt') || '').slice(0, 80)}"`); return; }
      if (tag === 'video' || tag === 'iframe') { out.push(`  ${tag.toUpperCase()} [${r2}] ${(el.getAttribute('src') || '').slice(0, 120)}`); }
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
      const blockText = ['p', 'h1', 'h2', 'h3', 'h4', 'li', 'a', 'button', 'span', 'div', 'strong', 'sup', 'b'].includes(tag);
      if (own && w > 0 && blockText) out.push(`  T ${tag}.${cls} [${r2}] ${el.getAttribute('data-t')} «${el.textContent.replace(/\s+/g, ' ').trim().slice(0, 110)}»${tag === 'a' ? ' href=' + (el.getAttribute('href') || '').slice(0, 100) : ''}`);
      if (own && w > 0 && blockText && !['a', 'button'].includes(tag)) { for (const c of el.children) if (c.tagName === 'A') out.push(`    A [${c.getAttribute('data-r')}] «${c.textContent.trim().slice(0, 60)}» href=${(c.getAttribute('href') || '').slice(0, 100)}`); return; }
      for (const c of el.children) walk(c);
    };
    walk(r); return out.join('\n');
  }).join('\n');
}, [root, all === '--all']));
await b.close();
