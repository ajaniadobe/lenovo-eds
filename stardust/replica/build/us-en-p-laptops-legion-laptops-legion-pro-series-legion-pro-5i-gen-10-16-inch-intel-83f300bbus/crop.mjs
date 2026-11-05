// crop.mjs <png> <out.png> <x> <y> <w> <h> [factor] — one crop per fact (pngjs, box downscale by integer factor)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { PNG } = createRequire('/app/node_modules/')('pngjs');
const [src, out, x, y, w, h, f = '1'] = process.argv.slice(2);
const im = PNG.sync.read(fs.readFileSync(src)); const k = +f;
const W = Math.floor(+w / k), H = Math.floor(Math.min(+h, im.height - +y) / k);
const o = new PNG({ width: W, height: H });
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const acc = [0, 0, 0]; for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) { const p = ((+y + j * k + dy) * im.width + (+x + i * k + dx)) * 4; acc[0] += im.data[p]; acc[1] += im.data[p + 1]; acc[2] += im.data[p + 2]; }
  const q = (j * W + i) * 4; o.data[q] = acc[0] / k / k; o.data[q + 1] = acc[1] / k / k; o.data[q + 2] = acc[2] / k / k; o.data[q + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o)); console.log(out, W, H, 'src', im.width, im.height);
