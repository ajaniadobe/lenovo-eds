// Compact view of a measure.mjs JSON: node mview.mjs <json> <width> [selRegex] [maxMatches]
import fs from 'node:fs';
const [f, w, re = '.', max = '2'] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync(f, 'utf8'));
const url = Object.keys(j.pages)[0];
console.log('root', JSON.stringify(j.root[url][w]));
const P = j.pages[url][w];
const skip = { display: 'block', position: 'static', boxSizing: 'content-box', maxWidth: 'none', margin: '0px', padding: '0px', gap: 'normal', backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none', letterSpacing: 'normal', textTransform: 'none', borderRadius: '0px', boxShadow: 'none', opacity: '1', objectFit: 'fill', textAlign: 'start' };
for (const s of Object.keys(P)) {
  if (!new RegExp(re).test(s)) continue;
  const arr = P[s]; if (!arr.length) { console.log(s, 'MISSING'); continue; }
  arr.slice(0, +max).forEach(m => {
    const p = Object.entries(m.props || {}).filter(([k, v]) => skip[k] !== v && !(k === 'border' && /^0px none/.test(v))).map(([k, v]) => `${k}:${String(v).replace('"Noto Sans", ', '').slice(0, 60)}`).join(' ');
    console.log(`${s}[${m.index}/${m.of}] ${m.rect.x},${m.rect.y} ${m.rect.w}x${m.rect.h}${m.visible ? '' : ' HIDDEN'} "${(m.text || '').slice(0, 40)}" ${m.img ? 'img ' + m.img.naturalWidth + 'x' + m.img.naturalHeight : ''}\n    ${p}`);
  });
}
