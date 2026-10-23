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
  if (o.hat) { P(x, o.hat, 2, 5, 20, 2); E(x, o.hat, 12, 3, 6, 3); P(x, o.hat, 2, 3, 2, 3); P(x, o.hat, 20, 3, 2, 3); }
  if (o.patch) { P(x, '#1b1830', 8, 10, 4, 3); P(x, '#1b1830', 6, 8, 12, 1); }
  if (o.lunettes) { P(x, '#5a4030', 5, 8, 14, 2); D(x, o.lunettes, 9, 8, 2); D(x, o.lunettes, 15, 8, 2); }
  if (o.tresse) for (let k = 0; k < 9; k++) P(x, k % 2 ? o.tresse : o.hair, 17 + (k % 2), 10 + k, 3, 1);
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
  SPR.belier = mk(40, 32, x => { E(x, '#9a8f80', 18, 19, 12, 8); E(x, '#b8ae9e', 18, 15, 10, 4); for (const lx of [9, 14, 21, 26]) P(x, '#6c6358', lx, 24, 3, 7);
    E(x, '#8a7f70', 31, 15, 6, 5); P(x, '#8a7f70', 34, 15, 5, 4); P(x, '#2a2a3a', 38, 16, 1, 1); P(x, '#ffb84a', 33, 13, 2, 1);
    E(x, '#5c544a', 29, 10, 4, 4); E(x, '#7b7266', 29, 10, 2, 2); P(x, '#5c544a', 25, 12, 3, 4); P(x, '#d8d0c0', 7, 14, 4, 3); });
  SPR.harpie = mk(40, 34, x => { for (let k = 0; k < 14; k++) { const hh = Math.max(2, 12 - Math.floor(k / 1.4)); P(x, '#8a93a8', 14 - k, 6 + Math.floor(k / 2), 1, hh); P(x, '#8a93a8', 26 + k, 6 + Math.floor(k / 2), 1, hh); }
    E(x, '#6c7488', 20, 18, 5, 8); D(x, '#e8c8a8', 20, 8, 4); P(x, '#4a4458', 15, 4, 10, 3); P(x, '#4a4458', 15, 6, 2, 8); P(x, '#4a4458', 23, 6, 2, 8);
    P(x, '#1b1830', 18, 8, 1, 1); P(x, '#1b1830', 21, 8, 1, 1); P(x, '#f2c14e', 17, 26, 2, 5); P(x, '#f2c14e', 22, 26, 2, 5); P(x, '#c9962e', 16, 30, 4, 1); P(x, '#c9962e', 21, 30, 4, 1); });
  SPR.varen = mk(34, 40, x => { for (let y = 16; y < 38; y++) { const w = 6 + Math.round((y - 16) * .3); P(x, y % 6 === 0 ? '#2a2440' : '#3b3256', 15 - w, y, 2 * w, 1); }
    P(x, '#7a52a0', 9, 18, 12, 2); D(x, '#e8c8a8', 15, 11, 5); E(x, '#e6e8f0', 15, 7, 6, 3); P(x, '#e6e8f0', 9, 7, 2, 7); P(x, '#c8ccd8', 19, 7, 2, 5);
    P(x, '#1b1830', 15, 11, 1, 1); P(x, '#1b1830', 18, 11, 1, 1); P(x, '#9a4a4a', 16, 14, 2, 1);
    for (let k = 0; k < 14; k++) P(x, '#d8e0ec', 23 + Math.round(k * .5), 14 + k, 2, 1); P(x, '#8a6a2a', 21, 27, 4, 2); P(x, '#0b0812', 9, 37, 4, 2); P(x, '#0b0812', 17, 37, 4, 2); });
  SPR.sansnom = mk(56, 64, x => { P(x, '#2a2836', 16, 44, 9, 18); P(x, '#2a2836', 31, 44, 9, 18); P(x, '#1a1824', 14, 60, 12, 3); P(x, '#1a1824', 30, 60, 12, 3);
    P(x, '#3b3850', 12, 20, 32, 26); P(x, '#2e2b40', 34, 20, 10, 26); P(x, '#5a566e', 12, 20, 32, 3); P(x, '#7a52a0', 12, 34, 32, 3);
    P(x, '#3b3850', 4, 22, 8, 22); P(x, '#3b3850', 44, 22, 8, 22); E(x, '#5a566e', 8, 21, 6, 4); E(x, '#5a566e', 48, 21, 6, 4);
    D(x, '#c8ccd8', 28, 11, 8); P(x, '#a8aab8', 20, 13, 16, 2); P(x, '#1b1830', 23, 11, 10, 1); P(x, '#1b1830', 24, 12, 8, 1);
    P(x, '#6c6358', 50, 4, 3, 40); P(x, '#4a4458', 46, 0, 11, 9); P(x, '#5c544a', 47, 1, 9, 2); });
  SPR.f_hilde = face({ skin: '#e8b890', hair: '#b8442a', cl: '#7a5233', cl2: '#5a3a22' });
  SPR.f_varen = face({ skin: '#e8c8a8', hair: '#e6e8f0', cl: '#3b3256', cl2: '#7a52a0' });
  SPR.f_sansnom = face({ skin: '#c8ccd8', helm: '#3b3850', cl: '#2a2836', cl2: '#7a52a0' });
  SPR.f_orvan = face({ skin: '#e6bf9c', hair: '#d8d8e0', beard: '#eeeeee', cl: '#6a4a8a' });
  SPR.f_nell = face({ skin: '#f0c8a8', hair: '#8a5a2a', hood: '#4a7a3a', cl: '#4a7a3a', cl2: '#3a5a2a' });
  SPR.f_berthe = face({ skin: '#e8b890', hair: '#c46a2a', cl: '#b83a3a', scarf: '#f2c14e' });
  SPR.f_aub = face({ skin: '#d8a078', mous: '#5a3a22', cl: '#7a5233' });
  SPR.f_tilo = face({ skin: '#f4d0b0', hair: '#3a2a1a', cl: '#3f8a4c' });
  SPR.f_brann = face({ skin: '#c99a74', helm: '#8a93a8', mous: '#4a3020', cl: '#5a6478', cl2: '#3a4258' });
  SPR.f_inconnu = face({ dark: true, hood: '#2a2440', cl: '#2a2440' });
  spritesActe2();
  spritesActe3();
  spritesActe4();
  for (const k in SPR) SPRURL[k] = SPR[k].toDataURL();
}

/* ---------- Acte 2 : Côte de Salvent ---------- */
function spritesActe2() {
  SPR.crabe = mk(36, 26, x => { E(x, '#d8643a', 18, 15, 11, 7); E(x, '#b84a2a', 18, 19, 10, 3); for (const [cx, cy] of [[12, 11], [17, 9], [22, 11], [15, 14], [21, 14]]) P(x, '#f4f0e8', cx, cy, 2, 1);
    for (const lx of [9, 12, 24, 27]) { P(x, '#a8402a', lx, 20, 2, 5); } P(x, '#d8643a', 27, 8, 4, 7); E(x, '#e87a4a', 32, 7, 4, 4); P(x, '#f4f0e8', 34, 6, 2, 1); P(x, '#d8643a', 4, 9, 4, 6); E(x, '#e87a4a', 4, 7, 4, 3);
    P(x, '#1b1830', 20, 7, 1, 2); P(x, '#1b1830', 24, 7, 1, 2); P(x, '#d8643a', 20, 4, 1, 4); P(x, '#d8643a', 24, 4, 1, 4); });
  SPR.sangsue = mk(38, 22, x => { for (let i = 0; i < 7; i++) E(x, i % 2 ? '#7a7f88' : '#8a909a', 6 + i * 4.3, 12 + Math.round(Math.sin(i * .9) * 3), 4, 5); E(x, '#5a5e66', 34, 11, 4, 5);
    D(x, '#c84a4a', 36, 11, 2); P(x, '#f4f4f4', 35, 9, 1, 1); P(x, '#f4f4f4', 35, 13, 1, 1); P(x, '#aab0b8', 4, 9, 30, 1); });
  SPR.follet = mk(26, 32, x => { for (let k = 0; k < 22; k++) { const w = Math.round(9 * Math.sin(Math.PI * Math.min(1, (k + 2) / 24)) * (k < 6 ? k / 6 : 1)); P(x, k < 8 ? '#cfefff' : '#6ab8ff', 13 - w + Math.round(Math.sin(k * .5)), 4 + k, 2 * w, 1); }
    E(x, '#e8f8ff', 13, 20, 5, 5); P(x, '#1b3a6a', 10, 19, 2, 3); P(x, '#1b3a6a', 15, 19, 2, 3); P(x, '#3a8ad8', 9, 28, 8, 2); });
  SPR.crapaud = mk(36, 30, x => { E(x, '#6a8a4a', 18, 19, 14, 9); E(x, '#a8b878', 18, 23, 10, 4); D(x, '#6a8a4a', 11, 9, 4); D(x, '#6a8a4a', 25, 9, 4); D(x, '#f2d84a', 11, 8, 2); D(x, '#f2d84a', 25, 8, 2);
    P(x, '#1b1830', 11, 8, 1, 2); P(x, '#1b1830', 25, 8, 1, 2); P(x, '#3a4a2a', 9, 16, 18, 1); for (const lx of [5, 28]) P(x, '#5a7a3a', lx, 24, 4, 5); for (const [cx, cy] of [[14, 13], [22, 15], [18, 11]]) P(x, '#4a6a3a', cx, cy, 2, 2); });
  SPR.noye = mk(32, 42, x => { for (let y = 12; y < 40; y++) { const w = 5 + Math.round((y - 12) * .25); P(x, y % 4 ? '#4a8a8a' : '#3a7070', 16 - w, y, 2 * w, 1); }
    D(x, '#9ac8c0', 16, 9, 6); P(x, '#2a3a4a', 9, 2, 14, 3); P(x, '#2a3a4a', 7, 4, 18, 2); P(x, '#0b2a2a', 13, 9, 2, 2); P(x, '#0b2a2a', 18, 9, 2, 2); P(x, '#2a5a3a', 15, 13, 2, 1);
    for (const lx of [8, 13, 20, 24]) P(x, '#3a8a4a', lx, 16 + (lx % 3) * 4, 2, 10); P(x, '#6a5a3a', 26, 18, 2, 14); P(x, '#8a8a8a', 24, 16, 6, 3); });
  SPR.poisson = mk(40, 22, x => { E(x, '#9ab0c8', 19, 11, 13, 6); E(x, '#d8e4f0', 19, 14, 10, 2); for (let k = 0; k < 6; k++) P(x, '#7a90a8', 4 + k, 11 - k, 2, 2 * k + 1);
    for (let k = 0; k < 8; k++) P(x, '#e8eef8', 14 + k, 4 - Math.floor(k / 3), 1, 3 + Math.floor(k / 3)); P(x, '#e8eef8', 20, 17, 6, 2);
    D(x, '#f4f4f4', 29, 9, 2); P(x, '#1b1830', 30, 9, 1, 1); P(x, '#5a6a80', 32, 12, 3, 1); });
  SPR.soldat = mk(32, 44, x => { P(x, '#4a4458', 10, 34, 5, 9); P(x, '#4a4458', 17, 34, 5, 9); P(x, '#8a8ea0', 8, 16, 16, 19); P(x, '#6c7080', 18, 16, 6, 19); P(x, '#7a52a0', 8, 26, 16, 3);
    D(x, '#8a8ea0', 16, 10, 6); P(x, '#1b1830', 12, 10, 8, 2); P(x, '#ff8a8a', 13, 10, 1, 1); P(x, '#ff8a8a', 18, 10, 1, 1); P(x, '#a8acb8', 15, 2, 2, 4);
    P(x, '#6a5a3a', 26, 2, 2, 38); for (let k = 0; k < 5; k++) P(x, '#d8e0ec', 27 - k / 2, k, k + 1, 1); P(x, '#8a8ea0', 4, 18, 4, 12); P(x, '#7a52a0', 3, 20, 6, 6); });
  SPR.vouivre = mk(64, 56, x => { for (let i = 0; i < 12; i++) E(x, i % 2 ? '#3f7a4a' : '#4a8a52', 8 + i * 3.4, 44 - Math.round(Math.sin(i * .55) * 6), 6, 5);
    for (let k = 0; k < 18; k++) { P(x, '#5aa060', 22 + k, 10 + Math.round(k * .35), 1, 18 - k); P(x, '#4a8a52', 40 - k, 12 + Math.round(k * .3), 1, 14 - Math.round(k * .6)); }
    E(x, '#4a8a52', 50, 22, 7, 6); E(x, '#3f7a4a', 46, 30, 5, 9); P(x, '#4a8a52', 54, 22, 9, 4); P(x, '#a8d070', 55, 26, 8, 2); P(x, '#f4f4f4', 57, 25, 1, 1); P(x, '#f4f4f4', 60, 25, 1, 1);
    P(x, '#ffd84a', 52, 19, 2, 2); P(x, '#2a5a32', 46, 14, 2, 5); P(x, '#2a5a32', 50, 13, 2, 5); E(x, '#a8d070', 30, 47, 14, 2); });
  SPR.mere = mk(66, 52, x => { E(x, '#b84a3a', 33, 30, 22, 13); E(x, '#d8643a', 33, 25, 20, 8); for (const [cx, cy, r] of [[22, 22, 3], [31, 19, 4], [41, 21, 3], [27, 28, 2], [44, 28, 3]]) { D(x, '#e8d8c0', cx, cy, r); D(x, '#c8b8a0', cx, cy, Math.max(1, r - 2)); }
    for (const lx of [12, 17, 22, 44, 49, 54]) P(x, '#8a3a2a', lx, 38, 3, 12);
    P(x, '#b84a3a', 52, 16, 6, 12); E(x, '#d8643a', 59, 12, 6, 6); P(x, '#f4f0e8', 61, 9, 4, 2); P(x, '#b84a3a', 8, 18, 6, 10); E(x, '#d8643a', 7, 14, 6, 5);
    P(x, '#1b1830', 38, 13, 2, 3); P(x, '#1b1830', 44, 13, 2, 3); P(x, '#b84a3a', 38, 8, 2, 6); P(x, '#b84a3a', 44, 8, 2, 6); P(x, '#3a8a4a', 14, 26, 2, 8); P(x, '#3a8a4a', 50, 30, 2, 6); });
  SPR.heraut = mk(42, 54, x => { P(x, '#3a2a4a', 14, 40, 6, 13); P(x, '#3a2a4a', 23, 40, 6, 13); for (let y = 16; y < 44; y++) { const w = 9 + Math.round((y - 16) * .2); P(x, y % 5 ? '#5a3a7a' : '#4a2a6a', 21 - w, y, 2 * w, 1); }
    P(x, '#c8ccd8', 13, 17, 16, 10); P(x, '#a8acb8', 23, 17, 6, 10); D(x, '#c8ccd8', 21, 10, 7); P(x, '#1b1830', 15, 10, 12, 2); P(x, '#7a52a0', 17, 9, 8, 1);
    P(x, '#f2c14e', 20, 1, 2, 4); P(x, '#6a5a3a', 34, 14, 2, 22); E(x, '#8a8ea0', 35, 12, 4, 4); P(x, '#c8ccd8', 33, 9, 1, 2); P(x, '#c8ccd8', 37, 9, 1, 2); P(x, '#7a52a0', 4, 22, 6, 14); });
  SPR.pie = mk(40, 34, x => { E(x, '#2a2a3a', 18, 18, 9, 7); E(x, '#f4f4f8', 16, 20, 5, 4); for (let k = 0; k < 12; k++) P(x, k % 2 ? '#6a7a9a' : '#3a3a5a', 2 + k, 14 + Math.round(k / 3), 1, 4);
    E(x, '#2a2a3a', 28, 11, 5, 5); P(x, '#3a3a4a', 32, 11, 6, 2); P(x, '#f2c14e', 28, 9, 2, 2); for (let k = 0; k < 10; k++) P(x, '#9aa8c8', 12 + k, 9 - Math.floor(k / 2), 1, 6);
    P(x, '#5a5a6a', 17, 25, 1, 6); P(x, '#5a5a6a', 21, 25, 1, 6); P(x, '#f2c14e', 24, 26, 2, 2); });
  SPR.bosco = mk(38, 46, x => { P(x, '#3a2a22', 11, 34, 6, 11); P(x, '#3a2a22', 20, 34, 6, 11); P(x, '#e8e0d0', 8, 16, 21, 19); for (let y = 18; y < 34; y += 3) P(x, '#3a5a8a', 8, y, 21, 1); P(x, '#5a3a22', 8, 30, 21, 3);
    D(x, '#d89a78', 18, 10, 6); P(x, '#b83a3a', 11, 4, 14, 3); P(x, '#b83a3a', 24, 6, 4, 2); E(x, '#5a3a22', 18, 15, 6, 3); P(x, '#1b1830', 15, 9, 2, 2); P(x, '#1b1830', 20, 9, 2, 2);
    P(x, '#e8e0d0', 3, 18, 5, 10); P(x, '#a8acb8', 3, 28, 2, 4); P(x, '#a8acb8', 2, 31, 3, 1); P(x, '#e8e0d0', 29, 18, 5, 10); for (let k = 0; k < 14; k++) P(x, '#d8e0ec', 32 + Math.round(k * .3), 12 + k, 2, 1); });
  SPR.f_maelle = face({ skin: '#e8c0a0', hair: '#b8b8c0', cl: '#3a6aa8', scarf: '#6a8ac8' });
  SPR.f_gaspard = face({ skin: '#f0c8a8', mous: '#8a6a4a', cl: '#8a5a3a', cl2: '#5a3a22' });
  SPR.f_loic = face({ skin: '#e0a880', hood: '#3a5a8a', beard: '#c8642a', cl: '#2a4a6a' });
  SPR.f_rosal = face({ skin: '#d89a78', hair: '#e8e8f0', hat: '#2a2028', patch: true, cl: '#7a2a2a', cl2: '#3a1a1a' });
  SPR.f_naia = face({ skin: '#f0d0b8', hair: '#3a8ad8', cl: '#f2c14e', cl2: '#d8a830' });
  SPR.f_nev = face({ skin: '#f0d8c8', hair: '#f4f4f8', hood: '#5a4a78', cl: '#5a4a78', cl2: '#7a52a0' });
  SPR.f_heraut = face({ skin: '#c8ccd8', helm: '#5a3a7a', cl: '#4a2a6a', cl2: '#7a52a0' });
  SPR.f_bosco = face({ skin: '#d89a78', hair: '#b83a3a', mous: '#5a3a22', cl: '#e8e0d0', cl2: '#3a5a8a' });
  SPR.f_erwan = face({ skin: '#d8a888', hair: '#9a9aa0', beard: '#a0a0a8', cl: '#e0b030' });
  SPR.f_ysold = face({ skin: '#ecd4c4', hair: '#d8d8e4', cl: '#3a2a5a', cl2: '#7a52a0' });
  // quêtes annexes de la vallée
  SPR.f_pia = face({ skin: '#f6d6b8', hair: '#7a4a22', cl: '#5aa04a', cl2: '#3f7a34', scarf: '#f2c14e' });
  SPR.f_roxane = face({ skin: '#d8a888', hair: '#1f1a24', cl: '#8a6a4a', cl2: '#c8b090', scarf: '#5a3a22' });
  SPR.f_fennel = face({ skin: '#e8b890', hat: '#5a7a3a', mous: '#a86a3a', cl: '#c8742a', cl2: '#7a5233' });
  SPR.sanglier = mk(44, 32, x => { E(x, '#6a4a3a', 21, 19, 15, 8); E(x, '#8a8e9a', 19, 13, 12, 4); for (const cx of [10, 16, 22, 28]) P(x, '#a8acb8', cx, 9, 4, 3);
    E(x, '#5a3a2a', 35, 19, 7, 6); P(x, '#3a2a22', 40, 19, 3, 3); P(x, '#f4f0e8', 38, 22, 2, 4); P(x, '#f4f0e8', 41, 21, 1, 3); P(x, '#ff5a3a', 35, 16, 2, 1);
    for (const lx of [10, 16, 25, 30]) P(x, '#4a3226', lx, 25, 3, 6); P(x, '#4a3226', 5, 15, 3, 2); });
  SPR.anguille = mk(46, 30, x => { for (let k = 0; k < 36; k++) { const yy = 15 + Math.round(6 * Math.sin(k / 5)); P(x, '#2a3a4a', 4 + k, yy - 3, 2, 7); P(x, '#4a6a7a', 4 + k, yy - 3, 2, 2); }
    E(x, '#2a3a4a', 41, 13, 4, 4); P(x, '#f2e14e', 42, 12, 1, 1); P(x, '#f4f4f4', 44, 15, 1, 1);
    for (const [cx, cy] of [[10, 7], [20, 22], [30, 6], [16, 4]]) { P(x, '#f2e14e', cx, cy, 1, 3); P(x, '#f2e14e', cx + 1, cy + 2, 1, 3); } });
}

function bgMarais(c, W, H) { const r = rng(61);
  dgrad(c, 0, 0, W, H * .5, ['#8a96a8', '#aab4c0', '#c8ccd0']);
  const gy = Math.round(H * .48); dgrad(c, 0, gy, W, H - gy, ['#8a8a6a', '#6a6a4a']);
  for (let i = 0; i < 9; i++) { const x = (i % 3) * W * .34 + W * .04 + (r() * 8 | 0), y = gy + 8 + Math.floor(i / 3) * H * .15, w = W * .24, h = H * .09; P(c, '#5a6a7a', x - 1, y - 1, w + 2, h + 2); P(c, i % 2 ? '#e8eef0' : '#d8e4e8', x, y, w, h); }
  for (let i = 0; i < 60; i++) { const x = r() * W, y = gy + r() * (H - gy); P(c, '#4a5a2a', x, y - 5, 1, 5); P(c, '#6a7a3a', x + 1, y - 3, 1, 3); }
  P(c, '#5a4030', W * .78, gy - 14, 22, 14); for (let k = 0; k < 8; k++) P(c, '#7a4a3a', W * .78 - 2 + k, gy - 22 + k, 26 - 2 * k, 1);
  c.fillStyle = 'rgba(230,236,240,.25)'; c.fillRect(0, gy - 6, W, 6); c.fillRect(0, gy + H * .2, W, 4); }
function bgSalvent(c, W, H, libre) { const r = rng(71);
  dgrad(c, 0, 0, W, H * .55, libre ? ['#6aa0d8', '#9ac4e8', '#e8d8b0'] : ['#7a8494', '#9aa2ae', '#b8bcc4']);
  const hy = Math.round(H * .5); dgrad(c, 0, hy, W, H - hy, libre ? ['#3a7ab8', '#2a5a90'] : ['#4a6a88', '#34506a']);
  P(c, '#3a3a40', W * .86, hy - H * .26, 7, H * .26); P(c, '#e8e8f0', W * .86, hy - H * .26, 7, 3); D(c, libre ? '#fff0a0' : '#8a8a70', W * .86 + 3, hy - H * .28, 3);
  if (libre) { c.fillStyle = 'rgba(255,240,160,.25)'; c.beginPath(); c.moveTo(W * .86 + 3, hy - H * .28); c.lineTo(W * .5, hy - H * .4); c.lineTo(W * .5, hy - H * .3); c.fill(); }
  for (let i = 0; i < 6; i++) { const x = i * W * .09, h = H * (.16 + r() * .08), w = W * .08; P(c, '#d8c8a8', x, hy + 6 - h, w, h); for (let k = 0; k < 6; k++) P(c, '#a8423a', x - 2 + k, hy + 6 - h - 6 + k, w + 4 - 2 * k, 1); P(c, '#3a3a5a', x + w * .4, hy - h * .5, 3, 4); }
  const qy = Math.round(H * .74); P(c, '#6a4a2a', 0, qy, W * .7, 5); for (let x = 2; x < W * .7; x += 10) P(c, '#4a3a20', x, qy + 5, 3, H - qy);
  for (const [f, col] of [[.2, '#b85a3a'], [.48, '#3a7a5a'], [.66, '#c8a040']]) { const x = W * f, y = qy + 12; P(c, col, x, y, 26, 6); P(c, '#4a3a2a', x + 2, y + 6, 22, 2); P(c, '#d8d0c0', x + 12, y - 16, 2, 16); }
  if (!libre) { c.fillStyle = 'rgba(220,226,232,.28)'; c.fillRect(0, hy - 10, W, 14); c.fillRect(0, qy - 20, W, 10); } }
function bgLanternes(c, W, H, allume) { const r = rng(83);
  dgrad(c, 0, 0, W, H * .6, allume ? ['#2a2a4a', '#5a4a5a', '#a88a5a'] : ['#141a24', '#1e2a30', '#2a3a3a']);
  const gy = Math.round(H * .58); dgrad(c, 0, gy, W, H - gy, allume ? ['#3a4a3a', '#1e2a24'] : ['#1a2622', '#0e1614']);
  for (const f of [.08, .36, .62, .9]) { const x = W * f; P(c, '#1a1a14', x, gy - H * .4, 4, H * .4); P(c, '#1a1a14', x - 6, gy - H * .3, 8, 2); P(c, '#1a1a14', x + 3, gy - H * .34, 9, 2); }
  for (const [f, y] of [[.22, .66], [.5, .72], [.78, .64]]) { const x = W * f, yy = H * y; P(c, '#3a2a1a', x, yy - 18, 2, 22); P(c, '#4a3a2a', x - 3, yy - 24, 8, 7);
    if (allume) { D(c, 'rgba(255,200,90,.22)', x + 1, yy - 20, 12); D(c, '#ffd070', x + 1, yy - 20, 2); } else P(c, '#2a2a2a', x - 1, yy - 22, 4, 3); }
  for (let i = 0; i < 40; i++) { const x = r() * W, y = gy + r() * (H - gy); P(c, '#2a3a2a', x, y - 4, 1, 4); }
  for (let i = 0; i < 18; i++) P(c, allume ? 'rgba(255,220,140,.5)' : 'rgba(140,200,255,.35)', r() * W, gy - 10 + r() * 40, 1, 1);
  c.fillStyle = allume ? 'rgba(255,220,160,.08)' : 'rgba(180,200,210,.10)'; c.fillRect(0, gy - 8, W, 10); }
function bgEpave(c, W, H) { const r = rng(91);
  dgrad(c, 0, 0, W, H, ['#4aa0b8', '#2a6a90', '#1a3a64', '#101e3a']);
  c.fillStyle = 'rgba(220,250,255,.08)'; for (const f of [.15, .4, .7]) { const x = W * f; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 10, 0); c.lineTo(x + 40, H); c.lineTo(x + 20, H); c.fill(); }
  const gy = Math.round(H * .8); dgrad(c, 0, gy, W, H - gy, ['#5a5a4a', '#3a3a30']);
  for (let k = 0; k < 30; k++) { const w = Math.round(W * .5 * Math.sin(Math.PI * k / 30)); P(c, k % 4 ? '#3a2a1e' : '#2a1e14', W * .48 - w / 2, gy - 30 + k, w, 1); }
  P(c, '#2a1e14', W * .58, gy - H * .5, 3, H * .5 - 20); P(c, '#2a1e14', W * .52, gy - H * .42, 22, 2); P(c, '#1a1410', W * .4, gy - 18, 6, 6);
  for (let i = 0; i < 26; i++) { const x = r() * W, h = 8 + r() * 22; for (let k = 0; k < h; k++) P(c, '#2a7a4a', x + Math.round(Math.sin(k * .4) * 2), gy + 4 - k, 1, 1); }
  for (let i = 0; i < 20; i++) D(c, 'rgba(220,250,255,.35)', r() * W, r() * H * .7, 1); }
function bgPhare(c, W, H, libre) { const r = rng(97);
  dgrad(c, 0, 0, W, H * .6, libre ? ['#4a6aa8', '#8aa8d0', '#e8c890'] : ['#3a3a4a', '#5a5a6a', '#7a7a84']);
  const hy = Math.round(H * .58); dgrad(c, 0, hy, W, H - hy, libre ? ['#2a5a8a', '#1a3a5a'] : ['#2a3a4a', '#1a2430']);
  E(c, '#3a3a40', W * .5, hy + 6, W * .26, 14); E(c, '#4a4a52', W * .5, hy + 2, W * .22, 8);
  const tx = W * .5 - 10, th = H * .48; for (let y = 0; y < th; y++) { const w = 14 + Math.round(y * .1); P(c, Math.floor(y / 8) % 2 ? '#e8e0d0' : '#b84a3a', W * .5 - w / 2, hy - th + y, w, 1); }
  P(c, '#2a2a30', tx - 2, hy - th - 12, 24, 12); D(c, libre ? '#fff0a0' : '#5a5a50', W * .5, hy - th - 6, 4);
  if (libre) { D(c, 'rgba(255,240,160,.18)', W * .5, hy - th - 6, 18); }
  else for (const dx of [-30, 26]) { P(c, '#4a3a2a', W * .5 + dx, hy - 30, 2, 30); P(c, '#7a52a0', W * .5 + dx + 2, hy - 30, 10, 14); D(c, '#f4f4f4', W * .5 + dx + 7, hy - 23, 2); }
  for (let i = 0; i < 30; i++) P(c, 'rgba(255,255,255,.4)', r() * W, hy + r() * (H - hy), 3, 1); }
function bgMapCote(c, W, H) { const n1 = vnoise(14, 22), n2 = vnoise(18, 8), im = c.getImageData(0, 0, W, H), d = im.data;
  const pal = { deep: hex('#1d3f7a'), sea: hex('#2f62a8'), sand: hex('#d8c38a'), g1: hex('#7a9a5e'), g2: hex('#6a8a50'), m1: hex('#8a9a7a') };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const nx = x / W, ny = y / H, v = n1(x, y) * .7 + n2(x, y) * .3, th = (BY[(y & 3) * 4 + (x & 3)] + .5) / 16;
    const cote = .32 + (v - .5) * .18 + Math.sin(ny * 5) * .04; let tt;
    if (nx < cote - .06) tt = nx < cote - .2 ? pal.deep : pal.sea; else if (nx < cote) tt = pal.sand; else tt = v + th * .18 < .55 ? pal.g2 : pal.g1;
    const k = (y * W + x) * 4; d[k] = tt[0]; d[k + 1] = tt[1]; d[k + 2] = tt[2]; d[k + 3] = 255; }
  c.putImageData(im, 0, 0); const r = rng(22), N = LIEUX;
  const at = (id, dx, dy) => { const p = surCarte(id, 'cote'); return [p.x * W + dx, p.y * H + dy]; };
  for (let i = 0; i < 14; i++) { const [x, y] = at('marais', (r() - .5) * 30, (r() - .5) * 18); P(c, '#e8eef0', x, y, 4, 2); }
  for (let i = 0; i < 12; i++) { const [x, y] = at('lanternes', (r() - .5) * 30, (r() - .5) * 16); P(c, '#3a5a4a', x, y, 3, 2); }
  for (const [dx, dy] of [[-6, -2], [1, -5], [5, 2], [-2, 4]]) { const [x, y] = at('salvent', dx, dy); P(c, '#d8c39a', x - 2, y - 2, 5, 3); P(c, '#a8423a', x - 3, y - 4, 7, 2); }
  { const [x, y] = at('phare', 0, 0); P(c, '#e8e0d0', x - 1, y - 9, 3, 9); P(c, '#b84a3a', x - 1, y - 6, 3, 2); D(c, '#fff0a0', x, y - 10, 1); }
  { const [x, y] = at('epave', 0, 0); P(c, '#4a3a2a', x - 5, y, 10, 2); P(c, '#4a3a2a', x, y - 6, 1, 6); } }



/* ---------- Acte 3 : Plaines de Cendre ---------- */
function salamandreSpr(w, h, s, couronne) { return mk(w, h, x => {
  const cy = h * .62;
  for (let k = 0; k < w * .38; k++) P(x, '#c8501a', 2 + k, cy + Math.round(Math.sin(k / 3) * 2) - 1, 2, Math.max(2, 5 * s - k * .2));
  E(x, '#e8742a', w * .5, cy, w * .22, h * .16); E(x, '#f2a040', w * .5, cy + h * .05, w * .16, h * .07);
  E(x, '#e8742a', w * .8, cy - h * .08, w * .12, h * .12); P(x, '#1b1830', w * .84, cy - h * .12, 2, 2); P(x, '#ffe080', w * .92, cy - h * .05, 2, 1);
  for (const lx of [.36, .46, .6, .7]) P(x, '#a83a14', w * lx, cy + h * .12, 3, h * .14);
  for (const [fx, fy] of [[.4, -.14], [.5, -.18], [.6, -.14]]) { P(x, '#1b1830', w * fx, cy + h * fy + 4, 3, 2); P(x, '#ffd060', w * fx, cy + h * fy, 2, 4); }
  if (couronne) for (let i = 0; i < 5; i++) { const cx = w * .74 + i * 3; for (let k = 0; k < 6 + (i % 2) * 3; k++) P(x, k < 3 ? '#fff0a0' : '#ff8a2a', cx, cy - h * .2 - k, 2, 1); }
}); }
function spritesActe3() {
  SPR.chien = wolf('#7a7470', '#4e4844', '#a8a29a', '#ff7a2a', false);
  SPR.scarabee = mk(36, 28, x => { E(x, '#2a1e1e', 18, 16, 13, 9); P(x, '#ff6a2a', 18, 8, 1, 17); for (const [cx, cy] of [[12, 13], [23, 12], [14, 19], [22, 19]]) P(x, '#c8401a', cx, cy, 3, 1);
    E(x, '#3a2a28', 31, 15, 4, 4); P(x, '#ffb040', 32, 13, 1, 1); for (const lx of [8, 14, 21, 27]) P(x, '#1a1212', lx, 23, 2, 4); P(x, '#3a2a28', 34, 10, 1, 4); });
  SPR.salamandre = salamandreSpr(36, 26, 1, false);
  SPR.salreine = salamandreSpr(60, 44, 1.6, true);
  SPR.ver = mk(40, 40, x => { for (let k = 0; k < 26; k++) { const cx = 20 + Math.round(Math.sin(k / 5) * 7), cy = 38 - k; D(x, k % 4 ? '#9a6a5a' : '#7a4a3e', cx, cy, 6 - Math.round(k / 13)); }
    D(x, '#5a2a24', 22, 10, 5); D(x, '#2a0e0e', 22, 10, 3); for (let i = 0; i < 6; i++) P(x, '#f4e8d8', 19 + i, 7 + (i % 2) * 5, 1, 2); });
  SPR.automate = mk(36, 44, x => { P(x, '#4a4440', 10, 34, 6, 9); P(x, '#4a4440', 20, 34, 6, 9); E(x, '#6a625a', 18, 24, 11, 11); E(x, '#8a8278', 15, 21, 6, 6);
    D(x, '#ff7a2a', 18, 26, 3); P(x, '#3a3430', 13, 6, 10, 8); P(x, '#ffb040', 15, 9, 2, 2); P(x, '#ffb040', 20, 9, 2, 2); P(x, '#5a5450', 17, 1, 2, 5);
    P(x, '#5a5450', 2, 18, 5, 12); P(x, '#3a3430', 0, 28, 9, 7); P(x, '#5a5450', 29, 18, 5, 12); P(x, '#3a3430', 27, 28, 9, 7); });
  SPR.sentinelle = mk(32, 44, x => { P(x, '#2a2228', 10, 34, 5, 9); P(x, '#2a2228', 17, 34, 5, 9); P(x, '#3a3038', 8, 16, 16, 19); P(x, '#2a2228', 18, 16, 6, 19); P(x, '#a83a2a', 8, 26, 16, 3);
    D(x, '#3a3038', 16, 10, 6); P(x, '#e8e0d0', 12, 9, 8, 3); P(x, '#1b1830', 13, 10, 6, 1); P(x, '#c8b8a8', 15, 2, 2, 4);
    P(x, '#5a4a3a', 26, 2, 2, 38); for (let k = 0; k < 6; k++) P(x, '#d8d0c8', 24 + k, 2 + k, 5 - Math.abs(3 - k), 1); P(x, '#3a3038', 4, 18, 4, 12); });
  SPR.lezard = mk(44, 28, x => { for (let k = 0; k < 14; k++) P(x, '#2a2222', 2 + k, 15 + Math.round(k / 5), 2, 4 - Math.round(k / 6)); E(x, '#2a2222', 22, 16, 11, 6); E(x, '#3a2e2a', 36, 13, 6, 5);
    for (const [cx, cy, w] of [[16, 13, 5], [24, 15, 6], [30, 12, 3], [20, 18, 4]]) P(x, '#ff6a1a', cx, cy, w, 1); P(x, '#ffd040', 38, 11, 2, 1);
    for (const lx of [14, 20, 26, 31]) P(x, '#1a1414', lx, 20, 3, 6); });
  SPR.esprit = mk(26, 32, x => { for (let k = 0; k < 22; k++) { const w = Math.round(9 * Math.sin(Math.PI * Math.min(1, (k + 2) / 24)) * (k < 6 ? k / 6 : 1)); P(x, k < 8 ? '#ffe8a0' : '#ff5a2a', 13 - w + Math.round(Math.sin(k * .6)), 4 + k, 2 * w, 1); }
    E(x, '#fff0c0', 13, 20, 5, 5); P(x, '#6a1a0a', 10, 19, 2, 3); P(x, '#6a1a0a', 15, 19, 2, 3); P(x, '#c83a1a', 9, 28, 8, 2); });
  SPR.forgeur = mk(64, 64, x => { P(x, '#3a3632', 18, 46, 11, 16); P(x, '#3a3632', 36, 46, 11, 16); P(x, '#2a2622', 16, 60, 14, 3); P(x, '#2a2622', 35, 60, 14, 3);
    P(x, '#5a544c', 14, 22, 37, 26); P(x, '#4a443e', 40, 22, 11, 26); P(x, '#7a7268', 14, 22, 37, 3); D(x, '#ff6a1a', 32, 34, 5); D(x, '#ffd060', 32, 34, 2);
    P(x, '#6a6258', 24, 8, 17, 15); P(x, '#4a443e', 35, 8, 6, 15); P(x, '#ffb040', 28, 14, 3, 2); P(x, '#ffb040', 34, 14, 3, 2);
    P(x, '#5a544c', 4, 24, 10, 22); P(x, '#5a544c', 51, 24, 10, 22); P(x, '#2a2622', 46, 6, 16, 8); P(x, '#2a2622', 52, 14, 4, 12);
    for (const cx of [6, 12]) { for (let k = 0; k < 10; k++) P(x, '#8a8278', cx, 46 + k, 1, 1); P(x, '#8a8278', cx - 2, 46, 5, 1); P(x, '#8a8278', cx - 2, 55, 5, 1); P(x, '#8a8278', cx + 2, 46, 1, 10); } });
  SPR.statue = mk(32, 44, x => { P(x, '#7b7266', 8, 6, 16, 37); P(x, '#5c544a', 18, 6, 6, 37); P(x, '#9a9080', 8, 6, 16, 3); P(x, '#8ff3ff', 11, 14, 3, 2); P(x, '#8ff3ff', 18, 14, 3, 2);
    for (const cy of [24, 31]) P(x, '#5c544a', 9, cy, 13, 1); P(x, '#7b7266', 2, 20, 6, 14); P(x, '#7b7266', 24, 20, 6, 14); });
  SPR.tellure = mk(60, 60, x => { E(x, '#8a3a2a', 30, 38, 22, 18); E(x, '#a84a32', 26, 32, 14, 10); P(x, '#6a2a1e', 18, 52, 10, 7); P(x, '#6a2a1e', 34, 52, 10, 7);
    E(x, '#8a3a2a', 30, 14, 10, 9); P(x, '#ffd0a0', 25, 13, 3, 2); P(x, '#ffd0a0', 33, 13, 3, 2);
    for (const [cx, cy, h] of [[16, 26, 9], [44, 24, 11], [30, 30, 7], [22, 44, 6], [40, 42, 7]]) for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(3 * k / h)); P(x, '#ff6a8a', cx - ww / 2, cy - h + k, ww, 1); } });
  SPR.gardien = mk(48, 56, x => { P(x, '#2e2a2a', 13, 44, 8, 11); P(x, '#2e2a2a', 27, 44, 8, 11); P(x, '#3e3836', 10, 16, 28, 29); P(x, '#1a1616', 13, 19, 22, 23);
    for (const bx of [15, 20, 25, 30]) P(x, '#7a6e64', bx, 19, 2, 23); P(x, '#ff8a3a', 22, 28, 4, 4); P(x, '#5a504a', 10, 16, 28, 3); P(x, '#5a504a', 10, 42, 28, 3);
    P(x, '#3e3836', 17, 4, 14, 12); P(x, '#ffb040', 20, 9, 3, 2); P(x, '#ffb040', 26, 9, 3, 2); P(x, '#3e3836', 2, 17, 8, 18); P(x, '#3e3836', 38, 17, 8, 18);
    P(x, '#2a2424', 0, 33, 12, 9); P(x, '#2a2424', 36, 33, 12, 9); });
  SPR.brume = mk(36, 42, x => { for (let y = 8; y < 41; y++) { const w = 5 + Math.round((y - 8) * .38 + Math.sin(y / 3) * 1.5); P(x, y % 4 === 0 ? '#4a5a72' : '#5e6e88', 18 - w, y, 2 * w, 1); }
    D(x, '#5e6e88', 18, 10, 7); D(x, '#1a2230', 18, 11, 4); P(x, '#d8f0ff', 16, 11, 1, 1); P(x, '#d8f0ff', 20, 11, 1, 1);
    for (let k = 0; k < 12; k++) { P(x, '#4a5a72', 6 - Math.round(k / 4), 16 + k, 2, 1); P(x, '#4a5a72', 29 + Math.round(k / 4), 16 + k, 2, 1); } });
  SPR.f_goran = face({ skin: '#d8a078', beard: '#1f1a1a', cl: '#7a5233', cl2: '#3a2a1a' });
  SPR.f_agathe = face({ skin: '#ecc8b0', hair: '#a8a8b0', cl: '#5a3a6a', cl2: '#8a6aa0', scarf: '#c8a040' });
  SPR.f_dorn = face({ skin: '#c89a7a', helm: '#c8a040', beard: '#9a9aa0', cl: '#5a4a3a' });
  SPR.f_tobi = face({ skin: '#b8907a', helm: '#c8a040', cl: '#6a5a4a', cl2: '#4a3a2a' });
}

function bgChamps(c, W, H) { const r = rng(103);
  dgrad(c, 0, 0, W, H * .6, ['#3a2a3a', '#8a4a3a', '#e08a4a', '#f2b070']);
  const gy = Math.round(H * .6); dgrad(c, 0, gy, W, H - gy, ['#4a3a2e', '#2a201a']);
  for (let i = 0; i < 90; i++) { const x = r() * W, y = gy + r() * (H - gy); P(c, i % 3 ? '#1e1612' : '#6a4a2a', x, y - 5, 1, 5); }
  P(c, '#2a1e18', W * .7, gy - 26, 30, 26); for (let k = 0; k < 10; k++) P(c, '#1a1210', W * .7 - 3 + k, gy - 36 + k, 36 - 2 * k, 1); P(c, '#ff7a2a', W * .74, gy - 14, 4, 6);
  for (let i = 0; i < 4; i++) { const x = W * (.1 + i * .22); for (let k = 0; k < 30; k++) P(c, 'rgba(80,70,70,.35)', x + Math.sin(k / 4) * 4, gy - 10 - k * 2, 5, 2); }
  for (let i = 0; i < 26; i++) P(c, i % 2 ? '#ffb040' : '#ff6a2a', r() * W, gy - r() * H * .4, 1, 1); }
function bgForgecendre(c, W, H, libre) { const r = rng(107);
  dgrad(c, 0, 0, W, H * .58, libre ? ['#4a3a5a', '#a86a5a', '#f0b080'] : ['#2a1a1e', '#6a2a22', '#b8482a']);
  const gy = Math.round(H * .62); dgrad(c, 0, gy, W, H - gy, ['#4a3e36', '#2a221e']);
  for (let i = 0; i < 7; i++) { const x = i * W * .15 - 4, h = H * (.18 + r() * .1), w = W * .12; P(c, '#5a4a40', x, gy - h, w, h); P(c, '#3a302a', x + w * .7, gy - h, w * .3, h);
    P(c, libre ? '#ffd070' : '#ff7a3a', x + w * .3, gy - h * .5, 3, 4); const ch = x + w * .2; P(c, '#2a2220', ch, gy - h - 14, 5, 14);
    for (let k = 0; k < 14; k++) P(c, libre ? 'rgba(200,190,190,.3)' : 'rgba(140,60,50,.45)', ch + Math.sin(k / 3 + i) * 3, gy - h - 16 - k * 2, 5, 2); }
  if (!libre) for (const f of [.24, .7]) { P(c, '#3a3038', W * f, gy - H * .3, 2, H * .3); P(c, '#7a52a0', W * f + 2, gy - H * .3, 10, 14); D(c, '#f4f4f4', W * f + 7, gy - H * .3 + 7, 2); }
  for (let x = 0; x < W; x += 12) P(c, '#5a4a3e', x, gy + 4, 8, 3);
  for (let i = 0; i < 20; i++) P(c, '#ffb040', r() * W, r() * H * .5, 1, 1); }
function bgMines(c, W, H, libre) { const r = rng(109);
  dgrad(c, 0, 0, W, H, ['#1a0e0c', '#3a1a14', '#5a2a1e']);
  for (let i = 0; i < 20; i++) E(c, '#4a1e16', r() * W, r() * H * .7, 10 + (r() * 18 | 0), 6 + (r() * 10 | 0));
  for (const f of [.12, .5, .88]) { const x = W * f; P(c, '#5a3a22', x - 3, H * .18, 6, H * .62); P(c, '#5a3a22', x - 14, H * .18, 28, 5);
    if (libre) { D(c, 'rgba(255,200,90,.2)', x, H * .26, 10); D(c, '#ffd070', x, H * .26, 2); } }
  const gy = Math.round(H * .8); dgrad(c, 0, gy, W, H - gy, ['#3a2018', '#1a0e0a']);
  P(c, '#6a6a70', 0, gy + 8, W, 2); P(c, '#6a6a70', 0, gy + 16, W, 2); for (let x = 2; x < W; x += 9) P(c, '#4a2a1a', x, gy + 6, 3, 14);
  for (const [f, sz] of [[.3, 18], [.68, 14]]) { const x = W * f, y = gy - sz; for (let k = 0; k <= sz; k += 4) { P(c, '#8a8278', x + k, y, 1, sz); P(c, '#8a8278', x, y + k, sz, 1); }
    if (!libre) { D(c, '#ff6a2a', x + sz / 2, y + sz / 2, 3); } }
  for (let i = 0; i < 16; i++) P(c, '#ff6a4a', r() * W, r() * H * .7, 1, 1); }
function bgVolcan(c, W, H) { const r = rng(113);
  dgrad(c, 0, 0, W, H * .6, ['#1a0e1a', '#4a1a1e', '#a83a1e', '#e8702a']);
  const base = H * .7;
  for (let k = 0; k < H * .5; k++) { const w = W * .2 + k * 1.6; P(c, k % 7 ? '#2a1e1e' : '#3a2a26', W * .5 - w / 2, base - H * .5 + k, w, 1); }
  P(c, '#ff6a1a', W * .5 - W * .1, base - H * .5, W * .2, 2); for (let k = 0; k < 20; k++) P(c, 'rgba(120,90,90,.35)', W * .5 + Math.sin(k / 3) * 6, base - H * .5 - 4 - k * 2, 8, 2);
  for (const f of [.42, .55]) for (let k = 0; k < H * .45; k += 2) P(c, k % 4 ? '#ff7a1a' : '#ffc040', W * f + Math.sin(k / 6) * 5 + k * (f < .5 ? -.2 : .2), base - H * .48 + k, 2, 2);
  dgrad(c, 0, base, W, H - base, ['#2a1e1a', '#140c0a']);
  for (let i = 0; i < 30; i++) P(c, i % 2 ? '#ffb040' : '#ff5a1a', r() * W, r() * H * .6, 1, 1); }
function bgMapCendre(c, W, H) { const n1 = vnoise(24, 22), n2 = vnoise(28, 8), im = c.getImageData(0, 0, W, H), d = im.data;
  const pal = { c1: hex('#7a5a4a'), c2: hex('#6a4a3c'), c3: hex('#5a3e32'), m1: hex('#3a2a28'), lave: hex('#e8642a') };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const nx = x / W, ny = y / H, v = n1(x, y) * .7 + n2(x, y) * .3, th = (BY[(y & 3) * 4 + (x & 3)] + .5) / 16;
    const mont = Math.hypot((nx - .55) * 1.4, ny - .2) < .2 + v * .06, lave = Math.hypot((nx - .55) * 1.4, ny - .2) < .04;
    const tt = lave ? pal.lave : mont ? pal.m1 : v + th * .2 < .5 ? pal.c3 : v + th * .2 < .62 ? pal.c2 : pal.c1;
    const k = (y * W + x) * 4; d[k] = tt[0]; d[k + 1] = tt[1]; d[k + 2] = tt[2]; d[k + 3] = 255; }
  c.putImageData(im, 0, 0); const r = rng(32);
  const at = (id, dx, dy) => { const p = surCarte(id, 'cendre'); return [p.x * W + dx, p.y * H + dy]; };
  for (let i = 0; i < 18; i++) { const [x, y] = at('champs', (r() - .5) * 30, (r() - .5) * 18); P(c, '#2a1e18', x, y - 3, 1, 3); P(c, '#ff8a2a', x, y - 4, 1, 1); }
  for (const [dx, dy] of [[-6, -2], [1, -5], [5, 2], [-2, 4]]) { const [x, y] = at('forgecendre', dx, dy); P(c, '#8a7a6a', x - 2, y - 2, 5, 3); P(c, '#3a2a28', x - 3, y - 4, 7, 2); P(c, '#2a2220', x + 1, y - 8, 2, 4); }
  { const [x, y] = at('mines', 0, 0); P(c, '#1a0e0a', x - 3, y - 2, 6, 4); P(c, '#5a3a22', x - 4, y - 3, 8, 1); }
  { const [x, y] = at('pont', 0, 0); P(c, '#d8d0c0', x - 8, y, 16, 1); for (let k = -8; k < 8; k += 4) P(c, '#a89a80', x + k, y - 2, 1, 3); } }


/* ---------- Acte 4 : Hauts-Vents ---------- */
function rocSpr(vol) { return mk(vol ? 64 : 52, 48, x => {
  const st = '#8a8a90', sd = '#606068', hi = '#b4b4bc', cx = vol ? 32 : 24;
  if (vol) { for (let k = 0; k < 26; k++) { const yy = 10 + Math.floor(k / 2.2), hh = Math.max(3, 18 - Math.floor(k / 1.5)); P(x, k % 4 ? st : sd, cx - 6 - k, yy, 1, hh); P(x, k % 4 ? st : sd, cx + 5 + k, yy, 1, hh); }
    for (let k = 0; k < 6; k++) { P(x, hi, cx - 30 + k * 4, 21 + k, 3, 2); P(x, hi, cx + 27 - k * 4, 21 + k, 3, 2); } }
  E(x, st, cx, 25, 9, 12); E(x, hi, cx, 28, 6, 7);
  if (!vol) { E(x, sd, cx - 7, 24, 5, 11); E(x, sd, cx + 7, 24, 5, 11); for (let k = 0; k < 4; k++) P(x, hi, cx - 10, 18 + k * 4, 4, 1); P(x, sd, cx - 16, 32, 8, 3); }
  D(x, st, cx, 11, 6); P(x, '#ffb040', cx - 3, 9, 2, 2); P(x, '#ffb040', cx + 2, 9, 2, 2);
  P(x, '#d8c890', cx - 2, 13, 5, 3); P(x, '#d8c890', cx - 1, 16, 3, 2); P(x, '#b8a870', cx, 18, 1, 1);
  for (const dx of [-4, 3]) { P(x, '#c8a040', cx + dx, 36, 2, vol ? 6 : 8); P(x, '#2a2a30', cx + dx - 2, vol ? 41 : 44, 6, 2); }
}); }
function spritesActe4() {
  SPR.rapace = mk(42, 32, x => { for (let k = 0; k < 15; k++) { const hh = Math.max(2, 11 - Math.floor(k / 1.6)); P(x, k % 3 ? '#8a5a32' : '#6a4022', 15 - k, 5 + Math.floor(k / 2.5), 1, hh); P(x, k % 3 ? '#8a5a32' : '#6a4022', 26 + k, 5 + Math.floor(k / 2.5), 1, hh); }
    E(x, '#7a4a2a', 21, 17, 6, 8); E(x, '#d8b890', 21, 19, 3, 5); D(x, '#6a4022', 21, 8, 4); P(x, '#f2c14e', 23, 8, 4, 2); P(x, '#c9962e', 26, 10, 1, 1); P(x, '#ffdd55', 20, 7, 1, 1);
    P(x, '#f2c14e', 18, 25, 2, 5); P(x, '#f2c14e', 23, 25, 2, 5); P(x, '#c9962e', 17, 29, 4, 1); P(x, '#c9962e', 22, 29, 4, 1); P(x, '#5a3a1a', 18, 25, 7, 1); });
  SPR.sylphe = mk(30, 36, x => { for (let k = 0; k < 26; k++) { const w = Math.round(8 * Math.sin(Math.PI * Math.min(1, (k + 2) / 28)) * (k < 6 ? k / 6 : 1)); P(x, k < 10 ? '#f4fbff' : '#bfe6f2', 15 - w + Math.round(Math.sin(k * .45) * 3), 4 + k, 2 * w, 1); }
    for (let k = 0; k < 14; k++) { P(x, '#d8f2fa', 3 + k, 14 + Math.round(Math.sin(k / 2) * 2), 1, 1); P(x, '#d8f2fa', 26 - k, 20 + Math.round(Math.cos(k / 2) * 2), 1, 1); }
    P(x, '#3a6a8a', 12, 12, 2, 2); P(x, '#3a6a8a', 17, 12, 2, 2); });
  SPR.gargouille = mk(40, 40, x => { for (let k = 0; k < 10; k++) { P(x, '#6a6a72', 9 - k, 6 + k, 1, 12 - k); P(x, '#6a6a72', 30 + k, 6 + k, 1, 12 - k); }
    E(x, '#80808a', 20, 26, 10, 10); P(x, '#6a6a72', 12, 32, 6, 7); P(x, '#6a6a72', 22, 32, 6, 7); P(x, '#4a4a52', 10, 38, 20, 2);
    D(x, '#8e8e98', 20, 12, 6); P(x, '#5a5a62', 14, 3, 2, 5); P(x, '#5a5a62', 24, 3, 2, 5); P(x, '#ffcc40', 17, 11, 2, 2); P(x, '#ffcc40', 22, 11, 2, 2);
    P(x, '#2a2a30', 17, 15, 6, 2); P(x, '#f4f4f4', 18, 15, 1, 2); P(x, '#f4f4f4', 21, 15, 1, 2); for (let k = 0; k < 4; k++) P(x, '#9e9ea8', 15 + k * 3, 22 + (k % 2), 2, 1); });
  SPR.spectre = mk(32, 42, x => { for (let y = 10; y < 41; y++) { const w = 5 + Math.round((y - 10) * .36); P(x, y % 5 === 0 ? '#8aa6c8' : '#a8c2dc', 16 - w, y, 2 * w, 1); }
    for (let i = 0; i < 5; i++) x.clearRect(5 + i * 5, 38 + (i % 2), 2, 4);
    D(x, '#a8c2dc', 16, 11, 7); D(x, '#2a3448', 16, 12, 4); P(x, '#e8f4ff', 14, 12, 1, 1); P(x, '#e8f4ff', 18, 12, 1, 1);
    for (let k = 0; k < 7; k++) P(x, '#f0e8d0', 12 + k, 20 + Math.round(Math.sin(k / 2) * 2), 1, 1); P(x, '#f0e8d0', 15, 23, 2, 3); });
  SPR.griffon = mk(50, 40, x => { for (let k = 0; k < 16; k++) { const x0 = 8 + Math.round(k * .45); P(x, '#e8e0d0', x0, 2 + k, 4 + Math.round(k * 1.1), 1); if (k > 3 && k % 3 === 0) P(x, '#b8ac98', x0 + 2, 2 + k, Math.round(k * .9), 1); }
    E(x, '#c89a5a', 22, 24, 13, 7); E(x, '#a87a3a', 22, 20, 12, 3); for (const lx of [12, 17, 26, 31]) P(x, '#a87a3a', lx, 28, 3, 9);
    for (let k = 0; k < 8; k++) P(x, '#c89a5a', 4 - Math.round(k / 3), 18 + k, 3, 1); E(x, '#8a5a2a', 2, 26, 2, 3);
    E(x, '#f0ece4', 38, 13, 6, 6); P(x, '#f2c14e', 43, 13, 5, 2); P(x, '#c9962e', 46, 15, 2, 2); P(x, '#1b1830', 39, 11, 2, 2); P(x, '#d8d0c0', 34, 18, 6, 5);
    P(x, '#f2c14e', 32, 34, 3, 3); P(x, '#f2c14e', 37, 34, 3, 3); P(x, '#c89a5a', 32, 24, 7, 10); });
  SPR.givre = mk(40, 46, x => { P(x, '#7ab8e0', 10, 34, 8, 11); P(x, '#7ab8e0', 22, 34, 8, 11); P(x, '#a8d8f4', 8, 14, 24, 21); P(x, '#7ab8e0', 24, 14, 8, 21);
    for (const [cx, cy, h] of [[10, 14, 7], [18, 14, 9], [27, 14, 6], [4, 18, 5], [36, 20, 6]]) for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(4 * k / h)); P(x, '#e8f8ff', cx - ww / 2, cy - h + k, ww, 1); }
    P(x, '#a8d8f4', 13, 4, 14, 11); P(x, '#ffffff', 16, 8, 3, 2); P(x, '#ffffff', 22, 8, 3, 2);
    P(x, '#a8d8f4', 1, 16, 7, 16); P(x, '#a8d8f4', 32, 16, 7, 16); P(x, '#d8f0ff', 12, 20, 2, 10); P(x, '#d8f0ff', 18, 24, 6, 2); });
  SPR.serpent = mk(64, 64, x => { P(x, '#9a9aa8', 26, 4, 12, 60); P(x, '#b8b8c4', 26, 4, 3, 60); P(x, '#7a7a88', 35, 4, 3, 60);
    for (let k = 0; k < 120; k++) { const a = k / 9, cx = 32 + Math.cos(a) * 15, cy = 60 - k * .38; if (Math.sin(a) < 0 && k < 104) continue; D(x, k % 6 < 3 ? '#4aa8e8' : '#3a88c8', cx, cy, 5 - Math.round(k / 60)); if (k % 8 === 0) P(x, '#c8f4ff', cx, cy - 2, 2, 1); }
    E(x, '#4aa8e8', 44, 10, 9, 6); E(x, '#3a88c8', 50, 13, 6, 3); P(x, '#ffffff', 44, 8, 3, 2); P(x, '#1b1830', 45, 8, 1, 2); P(x, '#f4f4f4', 52, 15, 1, 2); P(x, '#f4f4f4', 55, 15, 1, 2);
    for (let k = 0; k < 5; k++) P(x, '#8ff3ff', 36 + k * 3, 2 + (k % 2) * 2, 2, 4); P(x, '#ff5a6a', 57, 13, 4, 1); });
  SPR.rocaile = rocSpr(false);
  SPR.rocaile_vol = rocSpr(true);
  SPR.f_tavor = face({ skin: '#e6bf9c', beard: '#f2f2f2', cl: '#7ab8e0', cl2: '#5a98c8' });
  SPR.f_edda = face({ skin: '#f0b898', hair: '#8a4a2a', hood: '#c84a4a', cl: '#d8b070', scarf: '#f4ece0' });
  SPR.f_joran = face({ skin: '#e0b090', hair: '#3a2a1a', cl: '#7a5233', cl2: '#5a3a22', lunettes: '#8ad0e8' });
  SPR.f_pell = face({ skin: '#f4d0b0', hair: '#d8642a', hat: '#6a4a2a', cl: '#4a6a8a', cl2: '#8a5a32', lunettes: '#f2c14e' });
  SPR.f_ilse = face({ skin: '#d8a880', hair: '#a8a8b0', tresse: '#8a8a92', cl: '#5a7a6a', cl2: '#3a5a4a' });
  // quêtes annexes des Hauts-Vents (0.5.2)
  SPR.prieur = mk(40, 52, x => { for (let y = 12; y < 51; y++) { const w = 6 + Math.round((y - 12) * .4); P(x, y % 6 === 0 ? '#6a86b8' : '#8aa6d0', 20 - w, y, 2 * w, 1); }
    for (let i = 0; i < 6; i++) x.clearRect(5 + i * 5, 48 + (i % 2), 2, 4); P(x, '#d8c890', 12, 20, 16, 3); P(x, '#d8c890', 18, 23, 4, 20);
    E(x, '#6a86b8', 20, 11, 9, 9); D(x, '#1a2234', 20, 13, 5); P(x, '#e8f4ff', 17, 13, 2, 1); P(x, '#e8f4ff', 22, 13, 2, 1);
    P(x, '#9a9aa8', 34, 4, 2, 46); D(x, '#b8b8c4', 35, 4, 3); });
  SPR.f_liss = face({ skin: '#e8c0a0', hair: '#f0f0f4', tresse: '#d8d8e0', cl: '#4a7ab8', cl2: '#3a5a98', scarf: '#7ab8e0' });
  SPR.wyverne = mk(60, 50, x => { for (let k = 0; k < 20; k++) { const hh = Math.max(2, 16 - Math.floor(k / 1.4)); P(x, k % 4 ? '#6a8aa8' : '#4a6a88', 22 - k, 6 + Math.floor(k / 2), 1, hh); P(x, k % 4 ? '#6a8aa8' : '#4a6a88', 34 + k, 6 + Math.floor(k / 2), 1, hh); }
    E(x, '#7a9ab8', 28, 28, 9, 11); E(x, '#b8d0e0', 28, 31, 5, 7); for (let k = 0; k < 12; k++) P(x, '#5a7a98', 18 - k, 36 + Math.floor(k / 3), 3, 2);
    P(x, '#5a7a98', 23, 37, 3, 9); P(x, '#5a7a98', 31, 37, 3, 9); P(x, '#2a2a30', 21, 45, 6, 2); P(x, '#2a2a30', 30, 45, 6, 2);
    for (let k = 0; k < 8; k++) P(x, '#7a9ab8', 30 + k, 18 - k, 4, 3); E(x, '#7a9ab8', 41, 9, 6, 4); P(x, '#d8e8f0', 40, 7, 2, 2); P(x, '#f4f4f4', 45, 11, 1, 2); P(x, '#a8b8c8', 44, 4, 2, 3); });
  const larme = (c1, c2, c3) => mk(44, 52, x => { P(x, c2, 12, 40, 7, 11); P(x, c2, 25, 40, 7, 11); E(x, c1, 22, 26, 13, 16); E(x, c2, 22, 30, 9, 9);
    P(x, c1, 2, 16, 8, 20); P(x, c1, 34, 16, 8, 20); D(x, c1, 22, 8, 7); P(x, '#ffffff', 18, 7, 2, 2); P(x, '#ffffff', 24, 7, 2, 2);
    D(x, '#ffffff', 22, 27, 4); D(x, c3, 22, 28, 2); for (let k = 0; k < 5; k++) P(x, c3, 8 + k * 7, 2 + (k % 2) * 3, 2, 4); });
  SPR.larmet = larme('#7ac8e8', '#4a98c8', '#e8f8ff');
  SPR.larmee = larme('#c8e8e0', '#6ab0b8', '#f4ffff');
  SPR.larmef = larme('#e86a3a', '#a83a22', '#ffd860');
  SPR.larmev = larme('#a8c8f0', '#6a8ac8', '#e8f0ff');
}

function nuages(c, W, H, y0, y1, seed, col) { const r = rng(seed); for (let i = 0; i < 14; i++) { const x = r() * W, y = y0 + r() * (y1 - y0), w = 20 + r() * 40; E(c, col, x, y, w, 5 + r() * 6); } }
function bgPont(c, W, H) { const r = rng(127);
  dgrad(c, 0, 0, W, H, ['#4a7ac8', '#8ab8e8', '#d8ecf8', '#f4f8fc']);
  nuages(c, W, H, H * .55, H, 131, '#ffffff'); nuages(c, W, H, H * .1, H * .35, 137, 'rgba(255,255,255,.7)');
  const vx = W * .5, vy = H * .42;
  for (let k = 0; k < 40; k++) { const f = k / 40, y = H - (H - vy) * f * f * .2 - (H - vy) * f * .8, hw = W * .42 * (1 - f) + 3; P(c, k % 2 ? '#8a5a32' : '#a8743a', vx - hw, y, hw * 2, Math.max(1, 6 * (1 - f))); }
  for (const s of [-1, 1]) { for (let k = 0; k < 60; k++) { const f = k / 60, hw = W * .44 * (1 - f) + 4, y = H - (H - vy) * f - 22 * (1 - f) - Math.sin(f * Math.PI) * 6; P(c, '#5a3a22', vx + s * hw, y, 2, 2); }
    for (let k = 0; k < 8; k++) { const f = k / 8, hw = W * .44 * (1 - f) + 4, y = H - (H - vy) * f; P(c, '#5a3a22', vx + s * hw, y - 22 * (1 - f), 1, 22 * (1 - f)); } }
  for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H * .4; P(c, '#2a2a3a', x, y, 5, 1); P(c, '#2a2a3a', x + 2, y - 1, 1, 1); } }
function bgAerie(c, W, H) { const r = rng(139);
  dgrad(c, 0, 0, W, H * .7, ['#5a8ad0', '#9ac4ec', '#e8f0f4']); nuages(c, W, H, H * .62, H, 141, '#ffffff');
  for (let k = 0; k < H; k++) { const w = W * .38 + Math.sin(k / 9) * 10 + k * .12; P(c, k % 9 ? '#8a7a6a' : '#6a5a4a', 0, k, w, 1); }
  for (let i = 0; i < 6; i++) { const x = W * (.06 + i * .1) + (r() - .5) * 10, y = H * (.3 + (i % 3) * .14), w = 22, h = 16;
    P(c, '#5a3a22', x + 3, y + h, 2, H * .2); P(c, '#5a3a22', x + w - 5, y + h, 2, H * .2); P(c, '#b8865a', x, y, w, h); P(c, '#8a5a32', x + w * .7, y, w * .3, h); P(c, '#a8423a', x - 2, y - 4, w + 4, 4); P(c, '#ffd070', x + 6, y + 6, 3, 4);
    if (i < 5) P(c, '#d8c8a8', x + w, y + h - 2, W * .1 - w + 6, 1); }
  for (const [kx, ky, col] of [[.62, .18, '#ff7a45'], [.78, .1, '#f2c14e'], [.88, .26, '#52b6ff']]) { const x = W * kx, y = H * ky;
    for (let k = 0; k < 5; k++) P(c, col, x - k, y + k, 2 * k + 1, 1); for (let k = 0; k < 4; k++) P(c, col, x - 3 + k, y + 5 + k, 7 - 2 * k, 1); for (let k = 0; k < 24; k++) P(c, '#f4f4f4', x - k * .6, y + 9 + k, 1, 1); } }
function bgRuines(c, W, H) { const r = rng(149);
  dgrad(c, 0, 0, W, H * .65, ['#6a7aa8', '#a8b8d8', '#e0e4f0']); nuages(c, W, H, H * .55, H * .8, 151, 'rgba(255,255,255,.85)');
  const gy = Math.round(H * .72); dgrad(c, 0, gy, W, H - gy, ['#8a8478', '#5a5650']);
  for (let x = 0; x < W; x += 14) P(c, '#6e6a62', x, gy + 6 + (x % 28 ? 0 : 8), 12, 1);
  for (let i = 0; i < 6; i++) { const x = W * (.08 + i * .17), h = H * (.2 + r() * .32), w = 12; P(c, '#c8c0b0', x, gy - h, w, h); P(c, '#a8a090', x + w - 4, gy - h, 4, h); P(c, '#d8d0c0', x - 3, gy - h, w + 6, 4); P(c, '#d8d0c0', x - 3, gy - 4, w + 6, 4);
    if (i % 2) for (let k = 0; k < 5; k++) P(c, '#a8a090', x + w + k * 3, gy - h + k * 2, 3, 2); }
  P(c, '#c8c0b0', W * .25, gy - H * .5, W * .5, 6); for (let k = 0; k < 12; k++) P(c, 'rgba(255,255,255,.25)', 0, gy - 6 - k * 3, W, 1);
  for (let i = 0; i < 20; i++) P(c, '#4a7a3a', r() * W, gy - r() * 6, 2, 3); }
function bgPic(c, W, H) { const r = rng(157);
  dgrad(c, 0, 0, W, H * .7, ['#2a2a48', '#4a4a6a', '#8a8ea8', '#c8d0dc']);
  for (let k = 0; k < H * .7; k++) { const w = 6 + k * 1.3; P(c, k % 6 ? '#4a4a58' : '#5a5a68', W * .5 - w / 2 + Math.sin(k / 7) * 4, H * .1 + k, w, 1); P(c, '#e8f0f8', W * .5 - w / 2 + Math.sin(k / 7) * 4, H * .1 + k, Math.max(2, w * .35), 1); }
  const gy = Math.round(H * .78); dgrad(c, 0, gy, W, H - gy, ['#e8f0f8', '#a8b8cc']);
  for (let i = 0; i < 50; i++) { const x = r() * W, y = r() * H; P(c, 'rgba(255,255,255,.7)', x, y, 4 + r() * 6, 1); }
  for (let i = 0; i < 30; i++) P(c, '#ffffff', r() * W, r() * H, 1, 1); }
function bgMapVents(c, W, H) { const n1 = vnoise(34, 26), n2 = vnoise(38, 9), im = c.getImageData(0, 0, W, H), d = im.data;
  const pal = { c1: hex('#8ab4e0'), c2: hex('#b8d4ee'), c3: hex('#e8f2fa'), r1: hex('#8a8478'), r2: hex('#6e6a62'), g: hex('#f4f8fc') };
  const iles = ['pont', 'aerie', 'ruines', 'pic', 'escalier'].map(id => surCarte(id, 'vents'));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const nx = x / W, ny = y / H, v = n1(x, y) * .7 + n2(x, y) * .3, th = (BY[(y & 3) * 4 + (x & 3)] + .5) / 16;
    const dmin = Math.min(...iles.map(p => Math.hypot((nx - p.x) * 1.6, ny - p.y))), roc = dmin < .09 + v * .05, glace = roc && ny < .3;
    const tt = glace ? pal.g : roc ? (v + th * .2 < .62 ? pal.r1 : pal.r2) : v + th * .25 < .5 ? pal.c1 : v + th * .25 < .62 ? pal.c2 : pal.c3;
    const k = (y * W + x) * 4; d[k] = tt[0]; d[k + 1] = tt[1]; d[k + 2] = tt[2]; d[k + 3] = 255; }
  c.putImageData(im, 0, 0);
  const at = (id, dx, dy) => { const p = surCarte(id, 'vents'); return [p.x * W + dx, p.y * H + dy]; };
  { const [x, y] = at('pont', 0, 0); P(c, '#8a5a32', x - 14, y, 28, 1); for (let k = -14; k < 14; k += 4) P(c, '#5a3a22', x + k, y - 2, 1, 3); }
  for (const [dx, dy] of [[-6, -2], [1, -5], [5, 2]]) { const [x, y] = at('aerie', dx, dy); P(c, '#b8865a', x - 2, y - 2, 5, 3); P(c, '#a8423a', x - 3, y - 4, 7, 2); P(c, '#5a3a22', x - 1, y + 1, 1, 3); }
  for (let k = 0; k < 4; k++) { const [x, y] = at('ruines', -6 + k * 4, 0); P(c, '#d8d0c0', x, y - 5 + (k % 2) * 2, 2, 5 - (k % 2) * 2); }
  { const [x, y] = at('pic', 0, 0); for (let k = 0; k < 8; k++) P(c, k < 3 ? '#ffffff' : '#5a5a68', x - k, y - 8 + k, 2 * k + 1, 1); }
  { const [x, y] = at('escalier', 0, 0); for (let k = 0; k < 6; k++) P(c, 'rgba(160,140,200,.8)', x - 3 + k, y - k * 2, 3, 1); } }


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
function bgCol(c, W, H, vide) { const r = rng(47);
  dgrad(c, 0, 0, W, H, vide ? ['#4a4e5e', '#6c7080', '#8a8e9c', '#a8acb6'] : ['#3a3a6a', '#8a6a7a', '#e0a070', '#f2c88a']);
  const pics = (base, haut, col, neige, seed) => { const q = rng(seed); for (let x = -10; x < W + 10;) { const w = 18 + (q() * 30 | 0), h = haut * (.6 + q() * .5); for (let k = 0; k < h; k++) { const ww = Math.round(w * k / h); P(c, col, x + (w - ww) / 2, base - h + k, ww, 1); if (neige && k < h * .25) P(c, '#eef0f6', x + (w - ww) / 2, base - h + k, ww, 1); } x += w * .7; } };
  pics(H * .5, H * .32, vide ? '#5a5e6c' : '#6a5a7a', true, 3); pics(H * .62, H * .26, vide ? '#4a4e5a' : '#4e4660', false, 9);
  const gy = Math.round(H * .74); dgrad(c, 0, gy - 10, W, H - gy + 10, vide ? ['#5c5a5e', '#3e3c42'] : ['#7a6a5a', '#4e4238']);
  for (let y = gy; y < H; y++) { const tt = (y - gy) / (H - gy), w = 8 + tt * W * .22; P(c, vide ? '#7a7a80' : '#a8906a', W * .5 - w / 2, y, w, 1); }
  for (const [fx, h] of [[.12, .28], [.27, .2], [.74, .24], [.88, .3]]) { const x = W * fx, hh = H * h; P(c, '#5c544a', x - 4, gy - hh + 6, 9, hh); P(c, '#7b7266', x - 4, gy - hh + 6, 3, hh); P(c, '#3e3830', x + 3, gy - hh + 6, 2, hh); }
  const cx = W * .5, cy = gy - 4; P(c, '#5c544a', cx - 10, cy - 4, 21, 6);
  if (!vide) { D(c, 'rgba(255,190,90,.18)', cx, cy - 16, 18); D(c, 'rgba(255,190,90,.25)', cx, cy - 14, 10); for (let k = 0; k < 16; k++) { const ww = Math.max(1, Math.round(5 * Math.min(1, k / 6))); P(c, '#ffb84a', cx - ww / 2, cy - 22 + k, ww, 1); } P(c, '#fff0c0', cx - 1, cy - 18, 1, 8); }
  else for (let i = 0; i < 4; i++) P(c, '#2e2b40', cx - 8 + i * 5, cy - 18, 2, 14);
  for (let i = 0; i < 30; i++) P(c, vide ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.35)', r() * W, r() * H * .7, 1, 1); }
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
  'col': (c, w, h) => bgCol(c, w, h, false),
  'col-vide': (c, w, h) => bgCol(c, w, h, true),
  'carte': bgMap
};
Object.assign(DECORS_PROVISOIRES, {
  'marais': bgMarais,
  'salvent': (c, w, h) => bgSalvent(c, w, h, false),
  'salvent-libre': (c, w, h) => bgSalvent(c, w, h, true),
  'lanternes': (c, w, h) => bgLanternes(c, w, h, false),
  'lanternes-allume': (c, w, h) => bgLanternes(c, w, h, true),
  'epave': bgEpave,
  'phare': (c, w, h) => bgPhare(c, w, h, false),
  'phare-libre': (c, w, h) => bgPhare(c, w, h, true),
  'carte-cote': bgMapCote,
  'champs': bgChamps,
  'forgecendre': (c, w, h) => bgForgecendre(c, w, h, false),
  'forgecendre-libre': (c, w, h) => bgForgecendre(c, w, h, true),
  'mines': (c, w, h) => bgMines(c, w, h, false),
  'mines-libre': (c, w, h) => bgMines(c, w, h, true),
  'volcan': bgVolcan,
  'carte-cendre': bgMapCendre,
  'pont': bgPont,
  'aerie': bgAerie,
  'ruines': bgRuines,
  'pic': bgPic,
  'carte-vents': bgMapVents
});
