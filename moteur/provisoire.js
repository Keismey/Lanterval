/* Lanterval · dessins provisoires de la maquette (pixel art en code).
   Ils servent tant que l'image définitive d'un décor, d'un héros ou d'un monstre manque (voir donnees/images.js). */

function P(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function D(c, col, cx, cy, r) { c.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy); for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); c.fillRect(cx - w, cy + y, 2 * w + 1, 1); } }
function E(c, col, cx, cy, rx, ry) { c.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy); for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry)))); c.fillRect(cx - w, cy + y, 2 * w + 1, 1); } }
const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dgrad(c, x0, y0, w, h, cols) {
  x0 = Math.round(x0); y0 = Math.round(y0); w = Math.round(w); h = Math.round(h); if (w <= 0 || h <= 0) return;
  const im = c.getImageData(x0, y0, w, h), d = im.data, cs = cols.map(hex), n = cs.length - 1;
  for (let y = 0; y < h; y++) {
    const tt = y / Math.max(1, h - 1) * n, i = Math.min(n - 1, Math.floor(tt)), f = tt - i;
    for (let x = 0; x < w; x++) { const th = (BY[((y + y0) & 3) * 4 + ((x + x0) & 3)] + .5) / 16, col = f > th ? cs[i + 1] : cs[i], k = (y * w + x) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255; }
  }
  c.putImageData(im, x0, y0);
}
function vnoise(seed, cell) {
  const r = rng(seed), G = new Map(); const g = (i, j) => { const k = i * 7919 + j; if (!G.has(k)) G.set(k, r()); return G.get(k); };
  return (x, y) => { const gx = Math.floor(x / cell), gy = Math.floor(y / cell), fx = x / cell - gx, fy = y / cell - gy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = g(gx, gy), b = g(gx + 1, gy), c = g(gx, gy + 1), d = g(gx + 1, gy + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
}

/* ---------- Personnages et monstres ---------- */
const SPR = {}, SPRURL = {};
function mk(w, h, draw, outline) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); draw(x);
  const im = x.getImageData(0, 0, w, h), a = im.data; for (let i = 3; i < a.length; i += 4) a[i] = a[i] > 110 ? 255 : 0;
  const o = new Uint8ClampedArray(a), oc = hex(outline || '#120f22');
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const k = (y * w + X) * 4; if (a[k + 3]) continue;
    const nb = (X > 0 && a[k - 1]) || (X < w - 1 && a[k + 7]) || (y > 0 && a[k - w * 4 + 3]) || (y < h - 1 && a[k + w * 4 + 3]); if (nb) { o[k] = oc[0]; o[k + 1] = oc[1]; o[k + 2] = oc[2]; o[k + 3] = 255; } }
  im.data.set(o); x.putImageData(im, 0, 0); return cv;
}
function heroSpr(o) { return mk(32, 32, x => {
  const k = o.k;
  if (k === 'kael') { P(x, '#e6edf5', 4, 5, 2, 16); P(x, '#9fb0c4', 5, 5, 1, 16); P(x, '#8a6a2a', 2, 20, 6, 2); P(x, '#5a4020', 4, 22, 2, 3); }
  if (k === 'mira') { P(x, '#7a4a2a', 5, 7, 2, 23); D(x, '#ff7a45', 6, 6, 2); P(x, '#ffe1a0', 5, 5, 1, 1); }
  if (k === 'sol') { P(x, '#d8d2c0', 5, 10, 2, 20); D(x, '#52b6ff', 6, 8, 3); P(x, '#e2f6ff', 5, 7, 1, 1); }
  P(x, o.bd, 12, 24, 3, 5); P(x, o.bd, 17, 24, 3, 5); P(x, '#3a2a22', 11, 28, 5, 2); P(x, '#3a2a22', 17, 28, 5, 2);
  if (k === 'kael') { P(x, o.b, 10, 15, 12, 10); P(x, o.bd, 18, 15, 4, 10); } else { P(x, o.b, 10, 15, 12, 13); P(x, o.bd, 18, 15, 4, 13); P(x, o.bd, 10, 26, 12, 2); }
  P(x, o.acc, 10, 21, 12, 2);
  P(x, o.b, 7, 16, 3, 7); P(x, o.bd, 22, 16, 3, 7); D(x, o.skin, 8, 23, 1); D(x, o.skin, 23, 23, 1);
  D(x, o.skin, 16, 10, 6); P(x, '#1b1830', 13, 10, 1, 2); P(x, '#1b1830', 17, 10, 1, 2); P(x, '#b85a5a', 15, 13, 2, 1);
  E(x, o.h, 16, 6, 7, 4); P(x, o.h, 9, 6, 14, 3); P(x, o.hd, 9, 8, 2, 5); P(x, o.hd, 21, 8, 2, 5);
  if (k === 'kael') { P(x, o.h, 10, 1, 2, 3); P(x, o.h, 14, 0, 2, 3); P(x, o.h, 18, 1, 2, 3); P(x, '#f2c14e', 10, 15, 12, 2); P(x, '#f2c14e', 22, 15, 3, 6); P(x, '#c9962e', 23, 19, 2, 2); }
  if (k === 'mira') { P(x, o.h, 8, 8, 3, 12); P(x, o.h, 21, 8, 3, 12); P(x, o.hd, 8, 18, 3, 2); P(x, o.hd, 21, 18, 3, 2); }
  if (k === 'sol') { P(x, '#eef3f8', 9, 5, 14, 2); P(x, '#9fd8ff', 22, 5, 2, 4); }
}); }
function face(o) { return mk(24, 24, x => {
  P(x, o.cl, 3, 19, 18, 5); P(x, o.cl2 || o.cl, 3, 22, 18, 2);
  if (o.hood) E(x, o.hood, 12, 10, 9, 9);
  D(x, o.dark ? '#0b0812' : o.skin, 12, 11, 6);
  if (o.hair) { E(x, o.hair, 12, 6, 7, 3); P(x, o.hair, 5, 6, 3, 6); P(x, o.hair, 16, 6, 3, 6); }
  if (o.helm) { E(x, o.helm, 12, 6, 8, 4); P(x, o.helm, 4, 7, 16, 2); P(x, '#e8edf5', 11, 1, 2, 4); }
  if (o.dark) { P(x, '#ff4040', 9, 11, 1, 1); P(x, '#ff4040', 14, 11, 1, 1); }
  else { P(x, '#1b1830', 9, 11, 2, 2); P(x, '#1b1830', 13, 11, 2, 2); }
  if (o.beard) { E(x, o.beard, 12, 17, 6, 4); P(x, o.beard, 6, 13, 12, 2); }
  else if (!o.dark) P(x, '#9a4a4a', 11, 15, 3, 1);
  if (o.mous) P(x, o.mous, 9, 14, 7, 1);
  if (o.scarf) P(x, o.scarf, 5, 18, 14, 2);
}); }
function wolf(body, shade, belly, eye, scar) { return mk(40, 32, x => { E(x, body, 19, 19, 12, 7); E(x, shade, 19, 15, 11, 3); E(x, belly, 20, 23, 8, 3);
  E(x, body, 31, 14, 6, 5); P(x, body, 34, 14, 5, 4); P(x, '#2a2a3a', 38, 14, 1, 1); P(x, shade, 28, 6, 2, 5); P(x, shade, 32, 6, 2, 5);
  P(x, eye, 33, 12, 2, 1); P(x, '#f4f4f4', 35, 18, 1, 1); P(x, '#f4f4f4', 37, 18, 1, 1); if (scar) { P(x, '#e2c2c2', 30, 10, 1, 5); P(x, '#e2c2c2', 31, 11, 1, 1); }
  for (const lx of [10, 15, 23, 28]) P(x, shade, lx, 24, 3, 7); E(x, belly, 6, 14, 5, 2); P(x, belly, 2, 11, 3, 2); }); }

function dessinerSprites() {
  SPR.kael = heroSpr({ k: 'kael', skin: '#f1c7a0', h: '#f0d36a', hd: '#c9a540', b: '#3f6fc8', bd: '#2c4f96', acc: '#7a5233' });
  SPR.mira = heroSpr({ k: 'mira', skin: '#f4cfb0', h: '#d8413a', hd: '#a32e2a', b: '#e0703a', bd: '#b0502a', acc: '#f2c14e' });
  SPR.sol = heroSpr({ k: 'sol', skin: '#d9a57c', h: '#3a8ad8', hd: '#2a64a8', b: '#e8eef2', bd: '#b8c6d0', acc: '#52b6ff' });
  SPR.loup = wolf('#7d8aa6', '#5d6884', '#b6c0d6', '#ffdd55', false);
  SPR.alpha = wolf('#5a4a52', '#3e3238', '#8a7a80', '#ff4a4a', true);
  SPR.spore = mk(32, 32, x => { E(x, '#c64a5a', 16, 13, 13, 9); x.clearRect(0, 15, 32, 8); E(x, '#a33646', 16, 14, 13, 2);
    D(x, '#f8e9d8', 10, 8, 2); D(x, '#f8e9d8', 20, 6, 2); D(x, '#f8e9d8', 24, 11, 1); D(x, '#f8e9d8', 15, 4, 1);
    P(x, '#efe2c4', 10, 16, 12, 12); P(x, '#cdbf9e', 18, 16, 4, 12); P(x, '#1b1830', 12, 20, 2, 3); P(x, '#1b1830', 18, 20, 2, 3); P(x, '#c64a5a', 8, 27, 16, 2); P(x, '#efe2c4', 8, 28, 3, 2); P(x, '#efe2c4', 21, 28, 3, 2); });
  SPR.chauve = mk(38, 26, x => { for (let k = 0; k < 13; k++) { const yy = 7 + Math.floor(k / 3), hh = Math.max(2, 9 - Math.floor(k / 1.6)); P(x, '#7a52a0', 14 - k, yy, 1, hh); P(x, '#7a52a0', 24 + k, yy, 1, hh); }
    E(x, '#5a3c78', 19, 13, 5, 6); P(x, '#5a3c78', 15, 5, 2, 4); P(x, '#5a3c78', 21, 5, 2, 4); P(x, '#ff5a5a', 17, 11, 1, 1); P(x, '#ff5a5a', 21, 11, 1, 1); P(x, '#f4f4f4', 18, 15, 1, 2); P(x, '#f4f4f4', 20, 15, 1, 2); });
  SPR.gelee = mk(32, 30, x => { E(x, '#5fd0c8', 16, 20, 13, 9); x.clearRect(0, 27, 32, 3); P(x, '#3fa8a8', 4, 25, 24, 2);
    P(x, '#b8fff9', 13, 5, 3, 10); P(x, '#e8ffff', 13, 5, 1, 8); P(x, '#9ff2ee', 18, 8, 3, 7); P(x, '#9ff2ee', 9, 9, 2, 6);
    E(x, '#e9fffd', 10, 16, 3, 2); P(x, '#14303a', 11, 20, 2, 3); P(x, '#14303a', 19, 20, 2, 3); P(x, '#14303a', 14, 24, 4, 1); });
  SPR.ombre = mk(34, 38, x => { for (let y = 8; y < 37; y++) { const w = 4 + Math.round((y - 8) * .42); P(x, y % 5 === 0 ? '#221c36' : '#2a2440', 17 - w, y, 2 * w, 1); }
    D(x, '#2a2440', 17, 10, 7); D(x, '#0b0812', 17, 11, 4); P(x, '#ff4040', 15, 11, 1, 1); P(x, '#ff4040', 19, 11, 1, 1);
    P(x, '#c0c8d8', 29, 18, 1, 9); P(x, '#8a6a2a', 28, 26, 3, 2); P(x, '#3b3256', 25, 22, 4, 3); for (let i = 0; i < 5; i++) P(x, '#0b0812', 6 + i * 5, 35 + (i % 2), 3, 2); });
  SPR.golem = mk(64, 64, x => { P(x, '#5c5a7a', 18, 46, 11, 16); P(x, '#5c5a7a', 36, 46, 11, 16); P(x, '#45435e', 16, 60, 14, 3); P(x, '#45435e', 35, 60, 14, 3);
    P(x, '#7d7b9e', 14, 22, 37, 26); P(x, '#64628a', 40, 22, 11, 26); P(x, '#9896b8', 14, 22, 37, 3);
    P(x, '#8a88ad', 24, 8, 17, 15); P(x, '#706e94', 35, 8, 6, 15); P(x, '#8ff3ff', 28, 14, 3, 2); P(x, '#8ff3ff', 34, 14, 3, 2);
    P(x, '#7d7b9e', 4, 24, 10, 22); P(x, '#64628a', 51, 24, 10, 22); P(x, '#9896b8', 2, 44, 13, 7); P(x, '#706e94', 50, 44, 13, 7);
    for (let i = 0; i < 7; i++) { const w = i < 4 ? i : 6 - i; P(x, '#8ff3ff', 32 - w * 2, 28 + i * 2, w * 4 + 2, 2); } P(x, '#ffffff', 31, 32, 2, 4);
    for (const [cx, h] of [[8, 10], [11, 7], [56, 9], [53, 6], [28, 6], [38, 5]]) { for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(3 * k / h)); P(x, '#8ff3ff', cx - ww / 2, (cx > 20 && cx < 45 ? 8 : 24) - h + k, ww, 1); } } });
  SPR.f_orvan = face({ skin: '#e6bf9c', hair: '#d8d8e0', beard: '#eeeeee', cl: '#6a4a8a' });
  SPR.f_nell = face({ skin: '#f0c8a8', hair: '#8a5a2a', hood: '#4a7a3a', cl: '#4a7a3a', cl2: '#3a5a2a' });
  SPR.f_berthe = face({ skin: '#e8b890', hair: '#c46a2a', cl: '#b83a3a', scarf: '#f2c14e' });
  SPR.f_aub = face({ skin: '#d8a078', mous: '#5a3a22', cl: '#7a5233' });
  SPR.f_tilo = face({ skin: '#f4d0b0', hair: '#3a2a1a', cl: '#3f8a4c' });
  SPR.f_brann = face({ skin: '#c99a74', helm: '#8a93a8', mous: '#4a3020', cl: '#5a6478', cl2: '#3a4258' });
  SPR.f_inconnu = face({ dark: true, hood: '#2a2440', cl: '#2a2440' });
  for (const k in SPR) SPRURL[k] = SPR[k].toDataURL();
}

/* ---------- Décors ---------- */
function bgForest(c, W, H, calm) { const r = rng(21);
  dgrad(c, 0, 0, W, H, calm ? ['#1c3b3a', '#2f5e4a', '#5c8f5a', '#8fb86a'] : ['#0d201d', '#173a30', '#2a5a40', '#3e6e46']);
  for (let i = 0; i < W / 5; i++) { const x = r() * W | 0, w = 2 + r() * 3 | 0; P(c, calm ? '#2b4c40' : '#16302a', x, 0, w, H * .8); }
  for (let x = -4; x < W + 8; x += 7) D(c, calm ? '#1e4034' : '#122a24', x, 4 + (r() * 8 | 0), 9 + (r() * 4 | 0));
  c.fillStyle = calm ? 'rgba(255,240,170,.11)' : 'rgba(220,255,200,.06)';
  for (const f of [.18, .5, .78]) { const x = W * f; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 12, 0); c.lineTo(x + 44, H); c.lineTo(x + 22, H); c.fill(); }
  const gy = Math.round(H * .78);
  for (const f of [.05, .3, .66, .93]) { const x = W * f; P(c, '#3d2b1f', x - 6, 0, 12, gy + 2); P(c, '#2a1d15', x + 2, 0, 4, gy + 2); P(c, '#4e3829', x - 5, 0, 2, gy); P(c, '#3d2b1f', x - 10, gy - 2, 20, 4); }
  for (let x = 0; x < W; x += 9) D(c, calm ? '#2a5a3a' : '#1a3a2a', x + (r() * 4 | 0), 12 + (r() * 6 | 0), 7);
  dgrad(c, 0, gy, W, H - gy, ['#2f4f2c', '#243f24']);
  for (let y = gy; y < H; y++) { const tt = (y - gy) / (H - gy), w = 10 + tt * W * .2; P(c, '#6b5a3a', W * .48 - w / 2 + Math.sin(tt * 3) * 8, y, w, 1); }
  for (let i = 0; i < 22; i++) { const x = r() * W, y = gy + 2 + r() * (H - gy - 4); for (let k = -2; k <= 2; k++) P(c, '#3f7a3f', x + k * 2, y - 4 + Math.abs(k), 1, 4 - Math.abs(k)); }
  c.fillStyle = calm ? 'rgba(230,255,220,.05)' : 'rgba(200,230,220,.09)'; c.fillRect(0, gy - 12, W, 8); c.fillRect(0, gy + 5, W, 5);
  if (calm) { const r2 = rng(5); for (let i = 0; i < 24; i++) P(c, '#ffe680', r2() * W, r2() * H * .8, 1, 1); } }
function crystal(c, x, y, s, dark) { const col = dark ? '#353852' : '#7ff0ff', hi = dark ? '#4a4e6c' : '#e8ffff';
  if (!dark) { D(c, 'rgba(127,240,255,.10)', x, y - s * 1.4, Math.round(s * 2.6)); D(c, 'rgba(127,240,255,.12)', x, y - s, Math.round(s * 1.5)); }
  for (const [dx, hh, w] of [[-s * .6, s * 1.4, 3], [0, s * 2.2, 4], [s * .7, s * 1.1, 3]]) { const h = Math.round(hh); for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * Math.min(1, k / (h * .35)))); P(c, col, x + dx - ww / 2, y - h + k, ww, 1); } P(c, hi, x + dx - 1, y - h + 3, 1, Math.max(1, h - 5)); } }
function bgCave(c, W, H, dark) { const r = rng(33);
  dgrad(c, 0, 0, W, H, dark ? ['#06050b', '#110d1c', '#1a1326'] : ['#0b0d22', '#17183d', '#262456']);
  for (let i = 0; i < 22; i++) E(c, dark ? '#141022' : '#1d1c46', r() * W, r() * H * .8, 10 + (r() * 20 | 0), 6 + (r() * 12 | 0));
  for (let x = -2; x < W;) { const w = 4 + (r() * 9 | 0), h = 8 + (r() * H * .26 | 0); for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (1 - k / h))); P(c, dark ? '#1f1830' : '#2c2a5c', x + (w - ww) / 2, k, ww, 1); } x += w + (r() * 5 | 0); }
  const gy = Math.round(H * .76); dgrad(c, 0, gy, W, H - gy, dark ? ['#1a1426', '#100c18'] : ['#2b2a5a', '#1c1b40']);
  for (let x = 0; x < W;) { const w = 5 + (r() * 10 | 0), h = 4 + (r() * 14 | 0); for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (k / h))); P(c, dark ? '#221a33' : '#34326a', x + (w - ww) / 2, gy - h + k, ww, 1); } x += w + 6 + (r() * 30 | 0); }
  for (const [fx, fy, s] of [[.1, .74, 6], [.34, .44, 4], [.72, .62, 7], [.9, .36, 5], [.55, .86, 5], [.22, .2, 3]]) crystal(c, W * fx, H * fy, s, dark);
  if (dark) { for (const [fx, fy] of [[.3, .5], [.8, .3], [.62, .7]]) { P(c, '#ff3a3a', W * fx, H * fy, 1, 1); P(c, '#ff3a3a', W * fx + 3, H * fy, 1, 1); } } }
function bgMap(c, W, H) { const n1 = vnoise(4, 22), n2 = vnoise(8, 8), im = c.getImageData(0, 0, W, H), d = im.data;
  const pal = { deep: hex('#1d3f7a'), sea: hex('#2f62a8'), sand: hex('#d8c38a'), g1: hex('#5d9a4e'), g2: hex('#4f8a45'), g3: hex('#437a3e'), m1: hex('#8a7f70'), m2: hex('#6c6358') };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const nx = x / W, ny = y / H, v = n1(x, y) * .7 + n2(x, y) * .3;
    const edge = Math.min(nx, 1 - nx, ny, 1 - ny); let tt; const th = (BY[(y & 3) * 4 + (x & 3)] + .5) / 16;
    const water = (edge < .06 + v * .07) || Math.hypot((nx - .12) * 1.6, ny - .3) < .09 + v * .05;
    const mount = (ny < .4 && nx > .4 && v + (.4 - ny) * 1.2 > .75);
    if (water) tt = (edge < .03) ? pal.deep : pal.sea; else if (edge < .075 + v * .07) tt = pal.sand; else if (mount) tt = v + th * .15 > .85 ? pal.m2 : pal.m1; else { const g = v + th * .18; tt = g < .5 ? pal.g3 : g < .62 ? pal.g2 : pal.g1; }
    const k = (y * W + x) * 4; d[k] = tt[0]; d[k + 1] = tt[1]; d[k + 2] = tt[2]; d[k + 3] = 255; }
  c.putImageData(im, 0, 0); const r = rng(12), N = LIEUX;
  for (let i = 0; i < 34; i++) { const a = r() * 6.28, rr = r() * W * .09; const x = N.foret.x * W + Math.cos(a) * rr * 1.3, y = N.foret.y * H + Math.sin(a) * rr * .8; if (Math.hypot(x - N.foret.x * W, y - N.foret.y * H) < 7) continue; P(c, '#24502c', x - 1, y - 3, 3, 3); P(c, '#2e6a3a', x, y - 4, 1, 1); P(c, '#3d2b1f', x, y, 1, 1); }
  const mtn = (x, y, s, snow) => { for (let k = 0; k < s; k++) { P(c, '#7b7266', x - k, y - s + k, k * 2 + 1, 1); P(c, '#5c544a', x, y - s + k, k + 1, 1); } if (snow) for (let k = 0; k < 3; k++) P(c, '#f2f2f8', x - k, y - s + k, k * 2 + 1, 1); };
  mtn(N.grotte.x * W - 10, N.grotte.y * H + 6, 11, false); mtn(N.grotte.x * W + 9, N.grotte.y * H + 4, 9, false); P(c, '#1a1426', N.grotte.x * W - 2, N.grotte.y * H - 1, 4, 3);
  mtn(N.col.x * W - 8, N.col.y * H + 6, 12, true); mtn(N.col.x * W + 8, N.col.y * H + 7, 10, true);
  mtn(N.prof.x * W, N.prof.y * H + 5, 8, false); P(c, '#0b0812', N.prof.x * W - 2, N.prof.y * H + 1, 5, 3);
  for (let i = 0; i < 9; i++) { const x = N.marais.x * W + (r() - .5) * 24, y = N.marais.y * H + (r() - .5) * 14; P(c, '#7a8a4a', x, y - 3, 1, 3); P(c, '#9aa05a', x + 1, y - 4, 1, 2); }
  for (const [dx, dy] of [[-6, -2], [1, -5], [5, 2]]) { const x = N.lanterval.x * W + dx, y = N.lanterval.y * H + dy; P(c, '#d8c39a', x - 2, y - 2, 5, 3); P(c, '#a8423a', x - 3, y - 4, 7, 2); } }

// dessin provisoire d'un décor, par son nom dans donnees/images.js
const DECORS_PROVISOIRES = {
  'foret': (c, w, h) => bgForest(c, w, h, false),
  'foret-calme': (c, w, h) => bgForest(c, w, h, true),
  'grotte': (c, w, h) => bgCave(c, w, h, false),
  'grotte-sombre': (c, w, h) => bgCave(c, w, h, true),
  'carte': bgMap
};
