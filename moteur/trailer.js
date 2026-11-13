/* Lanterval · bande-annonce « Ce qui t'attend pour la suite », jouée à la fin de l'acte 1 (événement ['trailer'] de a1.e10),
   juste avant la fenêtre du verrou de l'acte 2 (moteur/verrou.js). On peut la revoir depuis cette fenêtre.

   Environ 48 s, en trois temps, sans révéler les grands retournements :
   1. l'histoire (musique « menace », fondus) : ce qui vient de se passer, puis les personnages et leurs secrets ;
   2. l'action (musique « boss ») : régions, boss, nouvelle alliée, classes, quêtes, en coupes franches calées sur le tempo ;
   3. l'équipe, le dernier voyage, le titre.

   Chaque plan de TRAILER a un type, une durée (d en ms, ou t en temps de la musique des boss) et, pour entrer,
   un fondu (ms ; sans fondu : coupe franche). Types :
     plan     une image cadrée à la main : cam = [depart, arrivee], chacun [x, y, zoom] ; x et y (de 0 à 1) désignent le
              point de l'image placé au centre du cadre, zoom 1 = l'image remplit tout juste le cadre. Sur téléphone
              le cadre est un rectangle 3:4 (un tiers de la largeur d'un panorama) sur un fond flou de la même image ;
              sur grand écran, c'est tout l'écran. Légende : narr (narration) ou replique + qui (portrait et nom).
     carton   une phrase sur fond noir
     region   la carte d'une région et son nom
     boss     un boss devant son décor ; le coup tombe au 3e temps (éclair, secousse, dégâts)
     alliee   la nouvelle héroïne
     classes  les 13 classes, qui défilent
     mot      un chiffre et un mot
     titre    le titre du jeu
     noir     écran noir
     musique  change de piste ; l'horloge des plans suivants part quand la piste commence à jouer
   Textes : trailer.* dans textes/<langue>/interface.txt. */
const TR_TEMPS = 375;   // durée d'un temps de son/boss.m4a (160 à la minute), en ms
const TR_CLASSES = ['moine', 'voleur', 'barde', 'corsaire', 'berserker', 'alchimiste', 'invocateur', 'geomancien', 'sage', 'ninja', 'lamemage', 'dragonnier'];
const TRAILER = [
  // 1. l'histoire
  { type: 'plan', img: 'pano.fete', cam: [[.62, .62, 1], [.64, .64, 1.22]], narr: 'trailer.n.lanterne', d: 2500, fondu: 700 },
  { type: 'plan', img: 'pano.cage', cam: [[.70, .5, 1.14], [.71, .5, 1]], narr: 'trailer.n.cristal', d: 2400, fondu: 450 },
  { type: 'carton', cle: 'trailer.c.debut', d: 2000, fondu: 350 },
  { type: 'plan', img: 'pano.salvent', cam: [[.50, .62, 1.05], [.80, .5, 1.05]], narr: 'trailer.n.salvent', d: 2700, fondu: 450 },
  { type: 'plan', img: 'pano.epave', cam: [[.52, .62, 1], [.60, .45, 1.12]], replique: 'trailer.q.sol', qui: 'sol', d: 2700, fondu: 450 },
  { type: 'plan', img: 'pano.naia', cam: [[.69, .62, 1.18], [.73, .56, 1]], narr: 'trailer.n.quai', d: 2300, fondu: 450 },
  { type: 'plan', img: 'pano.nev-champs', cam: [[.26, .5, 1.05], [.77, .55, 1.05]], doux: true, replique: 'trailer.q.nev', qui: 'nev', d: 2700, fondu: 300 },
  { type: 'plan', img: 'pano.cage-hilde', cam: [[.50, .5, 1.2], [.56, .5, 1]], replique: 'trailer.q.mira', qui: 'mira', d: 2500, fondu: 450 },
  { type: 'plan', img: 'pano.echo', cam: [[.5, .52, 1], [.5, .42, 1.3]], narr: 'trailer.n.sansnom', sombre: true, d: 2800, fondu: 600 },
  { type: 'noir', d: 300 },
  // 2. l'action : durées en temps de la musique
  { type: 'musique', piste: 'boss' },
  { type: 'region', img: 'decor.carte.cote', cle: 'trailer.region.cote', cam: [[.5, .5, 1], [.52, .52, 1.14]], t: 2 },
  { type: 'boss', monstre: 'vouivre', decor: 'decor.lanternes', cam: [[.5, .5, 1.05], [.5, .5, 1.15]], acte: 2, degats: 84, t: 4 },
  { type: 'boss', monstre: 'heraut', decor: 'decor.phare', cam: [[.5, .4, 1.05], [.5, .4, 1.15]], acte: 2, degats: 117, faiblesse: true, t: 4 },
  { type: 'region', img: 'decor.carte.cendre', cle: 'trailer.region.cendre', cam: [[.5, .5, 1], [.48, .45, 1.14]], t: 2 },
  { type: 'boss', monstre: 'forgeur', decor: 'decor.mines', cam: [[.55, .5, 1.05], [.55, .5, 1.15]], acte: 3, degats: 203, t: 4 },
  { type: 'alliee', heros: 'nev', decor: 'decor.champs', cam: [[.4, .5, 1.1], [.45, .5, 1.2]], t: 4 },
  { type: 'classes', t: 8 },
  { type: 'region', img: 'decor.carte.vents', cle: 'trailer.region.vents', cam: [[.5, .5, 1], [.5, .45, 1.14]], t: 2 },
  { type: 'boss', monstre: 'griffon', decor: 'decor.pic', cam: [[.6, .45, 1.05], [.6, .45, 1.15]], acte: 4, degats: 168, faiblesse: true, t: 4 },
  { type: 'boss', monstre: 'wyverne', decor: 'decor.pont', cam: [[.5, .5, 1.05], [.5, .5, 1.15]], acte: 4, degats: 241, t: 4 },
  { type: 'mot', n: '12', cle: 'trailer.mot.quetes', t: 2 },
  { type: 'plan', img: 'pano.rosal', cam: [[.5, .45, 1.25], [.5, .45, 1.08]], vif: true, t: 2 },
  { type: 'boss', monstre: 'varen', decor: 'decor.volcan', cam: [[.55, .45, 1.05], [.55, .45, 1.2]], rival: true, replique: 'trailer.q.varen', degats: 312, faiblesse: true, t: 6 },
  // 3. l'équipe, le dernier voyage, le titre
  { type: 'plan', img: 'pano.feu', cam: [[.515, .6, 1.3], [.515, .62, 1.02]], narr: 'trailer.n.equipe', t: 8, fondu: 500 },
  { type: 'plan', img: 'decor.escalier', cam: [[.5, .62, 1], [.56, .38, 1.25]], narr: 'trailer.n.voyage', t: 6, fondu: 500 },
  { type: 'noir', t: 1, fondu: 250 },
  { type: 'titre', d: 5000 }
];

function trPortrait(qui) { const f = ficheDe(qui) || {}; return f.portrait || f.fichier || ''; }
function trCam(img, cam, extra) { return `<img class="tr-cam ${extra || ''}" alt="" src="${imgSrc(img)}" data-cam='${JSON.stringify(cam)}'>`; }
function trLegende(p) {
  if (p.replique) return `<div class="tr-leg tr-rep"><img class="tr-av" alt="" src="${trPortrait(p.qui)}"><div><b>${esc(t('parle.' + p.qui))}</b><p>${html(t(p.replique))}</p></div></div>`;
  if (p.narr) return `<div class="tr-leg"><p class="tr-narr">${html(t(p.narr))}</p></div>`;
  return '';
}
function trailerPlan(p) {
  const duree = p.d || p.t * TR_TEMPS;
  if (p.type === 'plan') return `<div class="tr-vue tr-plan${p.sombre ? ' sombre' : ''}"><img class="tr-flou" alt="" src="${imgSrc(p.img)}"><div class="tr-cadre">${trCam(p.img, p.cam, p.doux ? 'doux' : p.vif ? 'vif' : '')}</div>${trLegende(p)}</div>`;
  if (p.type === 'carton') return `<div class="tr-vue tr-carton"><p>${html(t(p.cle))}</p></div>`;
  if (p.type === 'region') return `<div class="tr-vue tr-region"><img class="tr-flou" alt="" src="${imgSrc(p.img)}"><div class="tr-cadre">${trCam(p.img, p.cam, 'vif')}</div><div class="tr-leg tr-etiq"><span>${esc(t('trailer.tag.region'))}</span><h3>${html(t(p.cle))}</h3></div></div>`;
  if (p.type === 'boss') return `<div class="tr-vue tr-boss${p.rival ? ' rival' : ''}"><div class="tr-cadre plein">${trCam(p.decor, p.cam)}</div>
    <div class="tr-scene"><img class="tr-mon" alt="" src="${imgSrc('monstre.' + p.monstre)}"><i class="tr-entaille"></i>${p.faiblesse ? '<i class="tr-entaille deux"></i>' : ''}
      <b class="tr-degats${p.faiblesse ? ' faible' : ''}">${p.faiblesse ? `<small>${esc(t('trailer.faiblesse'))}</small>` : ''}${p.degats}</b></div>
    <div class="tr-leg tr-etiq"><span>${esc(p.rival ? t('trailer.tag.rival') : t('trailer.tag.boss', { n: p.acte }))}</span><h3>${esc(t('monstre.' + p.monstre))}</h3>${p.replique ? `<p class="tr-mot-rival">${html(t(p.replique))}</p>` : ''}</div></div>`;
  if (p.type === 'alliee') return `<div class="tr-vue tr-alliee"><div class="tr-cadre plein">${trCam(p.decor, p.cam)}</div><div class="tr-scene"><img class="tr-heroine" alt="" src="${imgSrc('heros.' + p.heros)}"></div>
    <div class="tr-leg tr-etiq"><span>${esc(t('trailer.tag.alliee'))}</span><h3>${esc(t('parle.' + p.heros))}</h3></div></div>`;
  if (p.type === 'classes') return `<div class="tr-vue tr-chiffre tr-classes"><b>13</b><span>${esc(t('trailer.mot.classes'))}</span><em class="tr-classe"></em></div>`;
  if (p.type === 'mot') return `<div class="tr-vue tr-chiffre"><b>${esc(p.n)}</b><span>${esc(t(p.cle))}</span></div>`;
  if (p.type === 'titre') return `<div class="tr-vue tr-titre"><img class="tr-fond" alt="" src="${imgSrc('titre.paix')}"><div class="tr-braises">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37 + 11) % 100}%;--d:${(i * 0.37 % 3).toFixed(2)}s;--v:${(3 + i % 4 * .8).toFixed(1)}s"></i>`).join('')}</div>
    <div class="tr-bloc"><span>${esc(t('trailer.titre.sur'))}</span><h2>Lanterval</h2><em>${esc(t('trailer.titre.actes'))}</em><p>${html(t('trailer.titre.sous'))}</p></div></div>`;
  return '<div class="tr-vue tr-noir"></div>';
}

// place une image dans son cadre et lance son mouvement de caméra, du cadrage de départ à celui d'arrivée
function trCamera(vue, duree) {
  vue.querySelectorAll('.tr-cam').forEach(img => {
    const c = img.parentNode.getBoundingClientRect(), r = (img.naturalWidth / img.naturalHeight) || 2.36;
    const ih = Math.max(c.height, c.width / r), iw = ih * r;
    img.style.width = iw + 'px'; img.style.height = ih + 'px';
    const pose = ([x, y, z]) => {
      const w = iw * z, h = ih * z;
      const tx = Math.min(0, Math.max(c.width - w, c.width / 2 - x * w)), ty = Math.min(0, Math.max(c.height - h, c.height / 2 - y * h));
      return `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${z})`;
    };
    const [de, a] = JSON.parse(img.dataset.cam);
    const calme = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!img.animate || calme) { img.style.transform = pose(a); return; }
    img.animate([{ transform: pose(de) }, { transform: pose(a) }],
      { duration: duree, fill: 'both', easing: img.classList.contains('doux') ? 'cubic-bezier(.45,0,.2,1)' : img.classList.contains('vif') ? 'cubic-bezier(.1,.7,.3,1)' : 'linear' });
  });
}

function trailer() {
  return new Promise(res => {
    const plans = TRAILER.filter(p => p.type !== 'musique');
    const d = document.createElement('div');
    d.className = 'trailer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', t('trailer.surtitre'));
    d.innerHTML = plans.map(trailerPlan).join('') + `<div class="tr-flash"></div><button class="tr-passer" type="button">${esc(t('trailer.passer'))}</button>`;
    document.body.appendChild(d);
    const vues = [...d.querySelectorAll('.tr-vue')], timers = [];
    let fini = false, avant = null;
    const a = (ms, f) => timers.push(setTimeout(() => { if (!fini) f(); }, ms));
    const pause = ms => new Promise(r => timers.push(setTimeout(r, Math.max(0, ms))));
    const flash = fort => { const f = d.querySelector('.tr-flash'); f.className = 'tr-flash'; void f.offsetWidth; f.className = 'tr-flash ' + (fort ? 'fort' : 'go'); };
    const secoue = () => { d.classList.remove('secoue'); void d.offsetWidth; d.classList.add('secoue'); };
    const fin = () => {
      if (fini) return; fini = true;
      timers.forEach(clearTimeout);
      d.classList.add('out'); setTimeout(() => d.remove(), 700);
      SON.ambiance();
      res();
    };
    d.querySelector('.tr-passer').onclick = fin;

    // un plan entre par-dessus le précédent, en fondu ou en coupe franche ; le précédent garde son mouvement jusqu'au bout
    const montrer = (el, p, duree) => {
      const f = p.fondu || 0, vieux = avant;
      el.style.transitionDuration = f + 'ms';
      trCamera(el, duree + 900);
      el.classList.add('on');
      if (vieux) timers.push(setTimeout(() => vieux.classList.remove('on'), f + 30));
      avant = el;
    };
    const effets = (el, p) => {
      if (p.type === 'boss') {
        SON.bruitage('recu');
        a(2 * TR_TEMPS, () => { el.classList.add('coup'); flash(); secoue(); SON.bruitage(p.faiblesse ? 'faiblesse' : 'coup'); });
        if (p.rival) a(4 * TR_TEMPS, () => { el.classList.add('parle'); });
      }
      if (p.type === 'region') SON.bruitage('ouvre');
      if (p.type === 'alliee') { flash(); SON.bruitage('union'); }
      if (p.type === 'mot') { secoue(); SON.bruitage('coup'); }
      if (p.type === 'classes') {
        const e = el.querySelector('.tr-classe'), noms = TR_CLASSES.map(c => t('classe.' + c)).concat('???'), pas = TR_TEMPS / 2;
        noms.forEach((n, i) => a(TR_TEMPS + i * pas, () => { e.textContent = n; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); e.classList.toggle('secret', n === '???'); SON.bruitage(n === '???' ? 'trouve' : 'clic'); }));
      }
      if (p.type === 'titre') { flash(true); SON.bruitage('palier'); }
    };

    (async () => {
      // tout est prêt avant le premier plan : les images (6 s au plus) et la musique de l'action
      const imgs = [...d.querySelectorAll('img')];
      SON.musique('menace', { coupe: .5, fondu: 1 });
      SON.precharger('boss');
      await Promise.race([Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))), pause(6000)]);
      let base = performance.now(), curseur = 0, k = 0;
      for (const p of TRAILER) {
        if (fini) return;
        if (p.type === 'musique') {
          // l'horloge de l'action part quand la piste joue (1,2 s d'attente au plus)
          await Promise.race([SON.musique(p.piste, { coupe: .12, fondu: .04 }), pause(1200)]);
          base = performance.now(); curseur = 0; flash(true);
          continue;
        }
        const el = vues[k++], duree = p.d || p.t * TR_TEMPS;
        montrer(el, p, duree); effets(el, p);
        curseur += duree;
        await pause(base + curseur - performance.now());
      }
      fin();
    })();
  });
}
