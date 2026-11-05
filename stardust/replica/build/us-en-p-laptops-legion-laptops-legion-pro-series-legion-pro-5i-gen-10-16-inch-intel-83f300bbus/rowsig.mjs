// rowsig.mjs <a.png> <b.png> [x0] [x1] [step] — print y-positions of strong horizontal transitions (row mean luminance jumps) on both, to align sections
import fs from 'node:fs'; import { createRequire } from 'node:module';
const { PNG } = createRequire('/app/node_modules/')('pngjs');
const [a, b, x0 = '0', x1 = '1440', thr = '40'] = process.argv.slice(2);
const sig = (f) => { const im = PNG.sync.read(fs.readFileSync(f)); const rows = []; for (let y = 0; y < im.height; y++) { let s = 0; for (let x = +x0; x < Math.min(+x1, im.width); x += 4) { const p = (y * im.width + x) * 4; s += im.data[p] + im.data[p + 1] + im.data[p + 2]; } rows.push(s / ((+x1 - +x0) / 4) / 3); } const ev = []; for (let y = 1; y < rows.length; y++) if (Math.abs(rows[y] - rows[y - 1]) > +thr) ev.push(y + ':' + Math.round(rows[y])); return ev; };
console.log('A', sig(a).join(' ')); console.log('B', sig(b).join(' '));
