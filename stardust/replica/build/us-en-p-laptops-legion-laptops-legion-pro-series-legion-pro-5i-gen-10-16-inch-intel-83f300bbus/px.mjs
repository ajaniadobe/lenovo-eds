// px.mjs <png> x,y [x,y…] — sample pixel colours
import fs from 'node:fs'; import { createRequire } from 'node:module';
const { PNG } = createRequire('/app/node_modules/')('pngjs');
const [src, ...pts] = process.argv.slice(2); const im = PNG.sync.read(fs.readFileSync(src));
for (const pt of pts) { const [x, y] = pt.split(',').map(Number); const p = (y * im.width + x) * 4; console.log(pt, im.data[p], im.data[p + 1], im.data[p + 2]); }
