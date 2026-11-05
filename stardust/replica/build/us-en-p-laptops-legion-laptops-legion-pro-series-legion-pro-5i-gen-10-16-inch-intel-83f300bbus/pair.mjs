// pair.mjs <a.png> <b.png> <out.png> <y> <h> [factor] — side-by-side crop (live | build) of the same band
import fs from 'node:fs'; import { createRequire } from 'node:module';
const { PNG } = createRequire('/app/node_modules/')('pngjs');
const [a, b, out, y, h, f = '1'] = process.argv.slice(2); const k = +f;
const A = PNG.sync.read(fs.readFileSync(a)), Bm = PNG.sync.read(fs.readFileSync(b));
const W = Math.floor(A.width / k), H = Math.floor(+h / k), o = new PNG({ width: W * 2 + 4, height: H });
o.data.fill(255);
[A, Bm].forEach((im, side) => { for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let r = 0, g = 0, bl = 0, n = 0; for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) { const yy = +y + j * k + dy, xx = i * k + dx; if (yy >= im.height) continue; const p = (yy * im.width + xx) * 4; r += im.data[p]; g += im.data[p + 1]; bl += im.data[p + 2]; n++; } const q = (j * o.width + i + side * (W + 4)) * 4; if (n) { o.data[q] = r / n; o.data[q + 1] = g / n; o.data[q + 2] = bl / n; } o.data[q + 3] = 255; } });
fs.writeFileSync(out, PNG.sync.write(o)); console.log(out, o.width, o.height);
