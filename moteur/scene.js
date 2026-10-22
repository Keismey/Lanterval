/* Lanterval · la scène : décor, panorama, lueur de la lanterne, monstres en combat, chiffres de dégâts.
   Chaque image passe par sa fiche dans donnees/images.js : image définitive, sinon dessin provisoire, sinon cadre nommé. */

let SCENE = { id: null, pano: false, lueur: null };

// adresse d'une image de personnage ou de monstre (définitive ou provisoire)
function imgSrc(id) {
  const f = IMAGES[id];
  if (!f) return '';
  return f.fichier || SPRURL[f.provisoire] || '';
}
function ficheDe(perso) { return IMAGES['heros.' + perso] || IMAGES['pnj.' + perso] || null; }
// avatar d'un héros ou d'un personnage
function av(perso, size) {
  const f = ficheDe(perso);
  if (!f) return `<span class="av ${size || ''}"></span>`;
  if (f.portrait) return `<span class="av face ${size || ''}"><img alt="" src="${f.portrait}"></span>`;
  const face = /^f_/.test(f.provisoire || '');
  return `<span class="av ${face ? 'face' : ''} ${size || ''}"><img alt="" src="${SPRURL[f.provisoire] || ''}"></span>`;
}

// décor d'un lieu selon son état (fete, calme, sombre…)
function decorDuLieu(lieu) {
  const e = etatLieu(lieu), id = 'decor.' + lieu;
  return e && IMAGES[id + '.' + e] ? id + '.' + e : id;
}
function lueurDuLieu(lieu) {
  if (!IMAGES['decor.' + lieu] || !IMAGES['decor.' + lieu].lueur) return null;
  return etatLieu(lieu) === 'fete' ? 'forte' : 'faible';
}

function setDecor(id, o) {
  o = o || {};
  SCENE = { id, pano: !!o.pano, lueur: o.lueur || null };
  const box = $('#decor'), f = IMAGES[id] || {};
  $('#scene').classList.toggle('pano', SCENE.pano);
  if (f.fichier) {
    box.innerHTML = (SCENE.pano ? `<img class="flou" alt="" src="${f.fichier}">` : '') +
      `<img class="${SCENE.pano ? 'large' : 'cover'}" alt="" src="${f.fichier}">` + (SCENE.lueur ? `<i class="lueur ${SCENE.lueur}"></i>` : '');
    const img = box.querySelector('img:last-of-type');
    if (img.complete) placerLueur(); else img.onload = placerLueur;
  } else if (DECORS_PROVISOIRES[f.provisoire]) {
    box.innerHTML = '<canvas id="cv"></canvas>';
    dessinerCanvas();
  } else {
    box.innerHTML = `<div class="cadre"><span>${esc(t('scene.image'))}</span><b>${esc(f.sujet || id)}</b></div>`;
  }
}
function dessinerCanvas() {
  const cv = $('#cv'), sc = $('#scene'); if (!cv) return;
  const bw = sc.clientWidth, bh = sc.clientHeight; if (!bw || !bh) return;
  const scale = Math.max(1, Math.round(Math.min(bh / 160, bw / 190))), W = Math.ceil(bw / scale), H = Math.ceil(bh / scale);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
  DECORS_PROVISOIRES[(IMAGES[SCENE.id] || {}).provisoire](c, W, H);
}
// la lueur suit le cristal de la lanterne, quel que soit le cadrage de l'image
function placerLueur() {
  const l = $('#decor .lueur'), img = $('#decor img.cover'), f = IMAGES[SCENE.id];
  if (!l || !img || !img.naturalWidth || !f.lueur) return;
  const cw = img.clientWidth, ch = img.clientHeight, s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const x = (cw - img.naturalWidth * s) / 2 + f.lueur[0] * img.naturalWidth * s, y = (ch - img.naturalHeight * s) / 2 + f.lueur[1] * img.naturalHeight * s;
  l.style.left = x + 'px'; l.style.top = y + 'px'; l.style.setProperty('--r', Math.round(img.naturalWidth * s * .06) + 'px');
}
// le décor provisoire est-il affiché ? (petite étiquette en haut à droite)
function decorProvisoire() { return !(IMAGES[SCENE.id] || {}).fichier; }

let resizeT;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { dessinerCanvas(); placerLueur(); if (typeof B !== 'undefined' && B) bOverlay(); }, 60); });

const ovc = () => $('#ovc');
function lbl(titre, sous) { return `<div class="lbl glass"><b>${esc(titre)}</b>${sous ? `<span>${esc(sous)}</span>` : ''}</div>` + (decorProvisoire() ? `<div class="ph glass">${esc(t('scene.provisoire'))}</div>` : ''); }
function fx(xp, yp, text, cls) { const d = document.createElement('div'); d.className = 'fnum ' + (cls || ''); d.style.left = xp + '%'; d.style.top = yp + '%'; d.innerHTML = text; $('#fx').appendChild(d); setTimeout(() => d.remove(), 1000); }

/* ---------- Monstres à l'écran pendant un combat ---------- */
const PLACES = { 1: [[.5, .78]], 2: [[.3, .72], [.7, .78]], 3: [[.18, .7], [.5, .78], [.82, .7]] };
function poserMonstres(ennemis) {
  const n = ennemis.length;
  ennemis.forEach((e, i) => { [e.px, e.py] = PLACES[n][i]; });
  $('#units').innerHTML = ennemis.map((e, i) => {
    const f = IMAGES['monstre.' + e.id] || {};
    return `<div class="unit ${f.fichier ? '' : 'pix'}" data-u="${i}" style="left:${e.px * 100}%;top:${e.py * 100}%;height:${MONSTRES[e.id].taille * 100}%"><img alt="" src="${imgSrc('monstre.' + e.id)}"></div>`;
  }).join('');
}
function majMonstres() {
  if (!B) return;
  B.enemies.forEach((e, i) => {
    const el = document.querySelector(`.unit[data-u="${i}"]`); if (!el) return;
    el.classList.toggle('mort', e.hp <= 0 && !e.dying);
    el.classList.toggle('mourant', !!e.dying);
    el.classList.toggle('brise', !!e.broken);
    el.classList.toggle('charge', !!e.charged);
    el.classList.toggle('actif', B.cur === e);
  });
}
// position du haut d'un monstre, en % de la scène (pour les chiffres de dégâts)
function epos(e) { return [e.px * 100, (e.py - MONSTRES[e.id].taille * .7) * 100]; }
async function hitFlash(u) {
  if (!u.isEnemy) { const c = document.querySelector(`.pcard[data-h="${u.id}"]`); if (c) { c.classList.remove('hit'); void c.offsetWidth; c.classList.add('hit'); } await wait(160); return; }
  const el = document.querySelector(`.unit[data-u="${B.enemies.indexOf(u)}"]`);
  if (el) { el.classList.remove('touche'); void el.offsetWidth; el.classList.add('touche'); }
  await wait(160);
}
