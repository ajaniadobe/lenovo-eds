// geo.mjs — section/blade rects from both live dumps → geo.json {sel: {1440: [[x,y,w,h]…], 360: […]}}
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const dir = new URL('./', import.meta.url).pathname;
const sels = ['main.main_content', '.product-singlePdpHero', 'nav.breadcrumb_common_container', '.hero-container', '.single_model_PDP_container_main_left', '.single_model_PDP_container_main_right', '.mainContent', 'nav.nav_container',
  'section.services_support_container', 'section.features_container', 'section.features_container > .feature-blade', '.product_techSpecs', 'section.merch-banner', 'div.ports_slots_container', 'section.similar_products_container', 'section.reviews_container', 'div.AccessoryPageBottom'];
const b = await chromium.launch(); const out = {};
for (const w of [1440, 360]) {
  const p = await (await b.newContext({ javaScriptEnabled: false })).newPage(); await p.route('**/*', r => r.abort());
  await p.setContent('<body>' + fs.readFileSync(dir + `live-${w}.html`, 'utf8') + '</body>', { waitUntil: 'domcontentloaded' });
  const r = await p.evaluate((sels) => Object.fromEntries(sels.map(s => [s, [...document.querySelectorAll(s)].map(e => (e.getAttribute('data-r') || '').split(',').map(Number))])), sels);
  for (const [k, v] of Object.entries(r)) (out[k] ||= {})[w] = v;
}
fs.writeFileSync(dir + 'geo.json', JSON.stringify(out)); await b.close();
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v[1440].slice(0, 3)), '|', JSON.stringify(v[360].slice(0, 3)));
