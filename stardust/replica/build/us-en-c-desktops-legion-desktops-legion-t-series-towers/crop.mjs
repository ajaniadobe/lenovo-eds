// crop.mjs <png> <out.png> <x> <y> <w> <h> [scale] — one crop per fact
import fs from 'node:fs';
import { chromium } from '/app/node_modules/playwright/index.mjs';
const [src, out, x, y, w, h, scale = '1'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
const data = fs.readFileSync(src).toString('base64');
await p.setContent(`<body style="margin:0;overflow:hidden"><img id=i src="data:image/png;base64,${data}" style="position:absolute;left:${-x}px;top:${-y}px"></body>`);
await p.waitForFunction(() => document.getElementById('i').complete);
await p.screenshot({ path: out }); await b.close();
