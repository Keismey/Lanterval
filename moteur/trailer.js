/* Lanterval · bande-annonce « Ce qui t'attend pour la suite », jouée à la fin de l'acte 1 (événement ['trailer'] de a1.e10),
   juste avant la fenêtre du verrou de l'acte 2 (moteur/verrou.js). On peut la revoir depuis cette fenêtre.
   Environ 40 s, en trois temps, sans révéler les grands retournements :
   1. l'accroche (musique « menace ») : quelques phrases sur l'histoire, puis des images qui posent les enjeux ;
   2. la montée (musique « boss », après un flash) : des combats en coupes rapides contre les boss des actes 2 à 4,
      entrecoupés de mots-chocs (régions, classes, quêtes), puis l'équipe au complet ;
   3. le titre.
   Plans : texte (phrase sur fond sombre), image (panorama en mouvement + phrase), menace (un ennemi dans le noir),
   combat (décor, monstre qui surgit, héros, coup, dégâts), mot (mot-choc plein écran), equipe, noir, titre.
   Durées en ms. Textes : trailer.* dans interface.txt. */
const TRAILER = [
  { type: 'texte', cle: 'trailer.t1', fond: 'pano.fete', duree: 2700 },
  { type: 'texte', cle: 'trailer.t2', fond: 'pano.cage', duree: 2700 },
  { type: 'texte', cle: 'trailer.t3', duree: 2300 },
  { type: 'image', img: 'pano.salvent', effet: 'approche', cle: 'trailer.salvent', duree: 2600 },
  { type: 'image', img: 'pano.epave', effet: 'glisse-d', cle: 'trailer.epave', duree: 2400 },
  { type: 'image', img: 'pano.nev-champs', effet: 'glisse-g', cle: 'trailer.nev', duree: 2400 },
  { type: 'menace', monstre: 'sansnom', cle: 'trailer.sansnom', duree: 2600 },
  // la montée
  { type: 'musique', piste: 'boss' },
  { type: 'combat', monstre: 'vouivre', decor: 'decor.lanternes', heros: 'sol', degats: 84, duree: 1150 },
  { type: 'combat', monstre: 'mere', decor: 'decor.epave', heros: 'mira', degats: 132, faiblesse: true, duree: 1150 },
  { type: 'mot', cle: 'trailer.mot.regions', duree: 950 },
  { type: 'combat', monstre: 'heraut', decor: 'decor.phare', heros: 'kael', degats: 117, duree: 1150 },
  { type: 'combat', monstre: 'forgeur', decor: 'decor.mines', heros: 'nev', degats: 203, faiblesse: true, duree: 1150 },
  { type: 'mot', cle: 'trailer.mot.classes', duree: 950 },
  { type: 'combat', monstre: 'griffon', decor: 'decor.pic', heros: 'mira', degats: 168, duree: 1150 },
  { type: 'combat', monstre: 'wyverne', decor: 'decor.pont', heros: 'sol', degats: 241, faiblesse: true, duree: 1150 },
  { type: 'mot', cle: 'trailer.mot.quetes', duree: 950 },
  { type: 'combat', monstre: 'varen', decor: 'decor.volcan', heros: 'kael', degats: 312, faiblesse: true, nom: true, duree: 1700 },
  { type: 'equipe', cle: 'trailer.equipe', duree: 2700 },
  { type: 'image', img: 'pano.pont', effet: 'rapide', duree: 1500 },
  { type: 'image', img: 'pano.braise', effet: 'rapide', duree: 1400 },
  { type: 'noir', duree: 500 },
  { type: 'titre', duree: 5200 }
];
const HEROS_TRAILER = ['kael', 'mira', 'sol', 'nev'];

function trailerPlan(p) {
  if (p.type === 'texte') return `<div class="tr-vue tr-texte">${p.fond ? `<img class="tr-fond" alt="" src="${imgSrc(p.fond)}">` : ''}<p>${html(t(p.cle))}</p></div>`;
  if (p.type === 'image') return `<div class="tr-vue tr-image ${p.effet}"><img alt="" src="${imgSrc(p.img)}">${p.cle ? `<p class="tr-phrase">${html(t(p.cle))}</p>` : ''}</div>`;
  if (p.type === 'menace') return `<div class="tr-vue tr-menace"><img class="tr-mon" alt="" src="${imgSrc('monstre.' + p.monstre)}"><p class="tr-phrase">${html(t(p.cle))}</p></div>`;
  if (p.type === 'combat') return `<div class="tr-vue tr-combat"><img class="tr-fond" alt="" src="${imgSrc(p.decor)}">
    <img class="tr-mon" alt="" src="${imgSrc('monstre.' + p.monstre)}"><img class="tr-heros" alt="" src="${imgSrc('heros.' + p.heros)}">
    <b class="tr-degats${p.faiblesse ? ' faible' : ''}">${p.faiblesse ? `<small>${esc(t('trailer.faiblesse'))}</small>` : ''}${p.degats}</b>
    ${p.nom ? `<p class="tr-nom">${esc(t('monstre.' + p.monstre))}</p>` : ''}</div>`;
  if (p.type === 'mot') return `<div class="tr-vue tr-mot"><p>${html(t(p.cle))}</p></div>`;
  if (p.type === 'equipe') return `<div class="tr-vue tr-equipe"><img class="tr-fond" alt="" src="${imgSrc('pano.feu')}"><div class="tr-ligne">${HEROS_TRAILER.map((h, i) => `<img alt="" src="${imgSrc('heros.' + h)}" style="--i:${i}">`).join('')}</div><p class="tr-phrase">${html(t(p.cle))}</p></div>`;
  if (p.type === 'titre') return `<div class="tr-vue tr-titre"><h2>Lanterval</h2><span>${esc(t('trailer.titre.actes'))}</span><p>${html(t('trailer.titre.sous'))}</p></div>`;
  return '<div class="tr-vue tr-noir"></div>';
}

function trailer() {
  return new Promise(res => {
    const plans = TRAILER.filter(p => p.type !== 'musique');
    const d = document.createElement('div');
    d.className = 'trailer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', t('trailer.surtitre'));
    d.innerHTML = plans.map(trailerPlan).join('') + `<div class="tr-flash"></div><button class="tr-passer" type="button">${esc(t('trailer.passer'))}</button>`;
    document.body.appendChild(d);
    SON.musique('menace');
    const vues = [...d.querySelectorAll('.tr-vue')], timers = [];
    let fini = false, avant = null;
    const a = (ms, f) => timers.push(setTimeout(f, ms));
    // un plan qui s'en va garde son mouvement pendant son fondu (pas de saut d'image)
    const montrer = el => { if (avant) avant.classList.remove('on'); el.classList.add('vu', 'on'); avant = el; };
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
    let ms = 150, k = 0;
    for (const p of TRAILER) {
      if (p.type === 'musique') { a(ms, () => { SON.musique(p.piste); flash(true); SON.bruitage('brise'); }); continue; }
      const el = vues[k++];
      a(ms, () => montrer(el));
      if (p.type === 'combat') {
        a(ms + 60, () => SON.bruitage('recu'));
        a(ms + 420, () => { el.classList.add('coup'); flash(); secoue(); SON.bruitage(p.faiblesse ? 'faiblesse' : 'coup'); });
      }
      if (p.type === 'mot') a(ms + 30, () => { secoue(); SON.bruitage('coup'); });
      if (p.type === 'menace') a(ms + 200, () => SON.bruitage('resiste'));
      if (p.type === 'equipe') a(ms + 300, () => SON.bruitage('union'));
      if (p.type === 'titre') a(ms + 100, () => { flash(true); SON.bruitage('palier'); });
      ms += p.duree;
    }
    a(ms, fin);
  });
}
