/* Lanterval · bande-annonce « Ce qui t'attend pour la suite », jouée à la fin de l'acte 1 (événement ['trailer'] de a1.e10),
   juste avant la fenêtre du verrou de l'acte 2 (moteur/verrou.js). On peut la revoir depuis cette fenêtre.
   Faite avec les panoramas des actes 2 à 4, sans rien révéler des grands retournements. Environ 46 s :
   carton d'ouverture, puis pour chaque acte un carton « Acte n · titre » et deux images, puis le carton de fin.
   Chaque image a son propre mouvement, lent (recul, approche, glissement, montée), et sa phrase en haut ou en bas.
   Textes : trailer.* dans interface.txt. */
const TRAILER = [
  { acte: 'a2' },
  { img: 'pano.salvent', effet: 'recul', txt: 'bas' },
  { img: 'pano.phare', effet: 'glisse-d', txt: 'haut' },
  { acte: 'a3' },
  { img: 'pano.forgecendre', effet: 'monte', txt: 'bas' },
  { img: 'pano.braise', effet: 'approche', txt: 'haut' },
  { acte: 'a4' },
  { img: 'pano.aerie', effet: 'glisse-g', txt: 'bas', de: '42%', a: '14%' },
  { img: 'pano.feu', effet: 'recul', txt: 'bas' }
];
const TRAILER_PLAN = 5300;    // durée d'une image (ms)
const TRAILER_ACTE = 2200;    // carton « Acte n »
const TRAILER_CARTON = 3000;  // cartons d'ouverture et de fin (ms)

function trailer() {
  return new Promise(res => {
    const d = document.createElement('div');
    d.className = 'trailer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', t('trailer.titre'));
    d.innerHTML = TRAILER.map(p => p.acte
      ? `<div class="tr-carton tr-acte"><span>${esc(t('trailer.acte', { n: p.acte.slice(1) }))}</span><h3>${html(t(p.acte + '.titre'))}</h3></div>`
      : `<div class="tr-plan ${p.effet}"${p.de ? ` style="--de:${p.de};--a:${p.a}"` : ''}><img alt="" src="${imgSrc(p.img)}"><div class="tr-txt ${p.txt}"><p>${html(t('trailer.' + p.img.replace('pano.', '')))}</p></div></div>`).join('')
      + `<div class="tr-carton" id="tr-debut"><span>${esc(t('trailer.surtitre'))}</span><h2>${html(t('trailer.titre'))}</h2></div>
      <div class="tr-carton" id="tr-fin"><h2>${html(t('trailer.fin'))}</h2><span>${esc(t('trailer.fin.sous'))}</span></div>
      <button class="tr-passer" type="button">${esc(t('trailer.passer'))}</button>`;
    document.body.appendChild(d);
    SON.musique('theme');
    const vues = [...d.querySelectorAll('.tr-plan, .tr-acte')], timers = [];
    let fini = false;
    const a = (ms, f) => timers.push(setTimeout(f, ms));
    const montrer = el => { d.querySelectorAll('.on').forEach(x => x.classList.remove('on')); if (el) el.classList.add('on'); };
    const fin = () => {
      if (fini) return; fini = true;
      timers.forEach(clearTimeout);
      d.classList.add('out'); setTimeout(() => d.remove(), 700);
      SON.ambiance();
      res();
    };
    d.querySelector('.tr-passer').onclick = fin;
    let ms = 100;
    a(ms, () => montrer(d.querySelector('#tr-debut')));
    ms += TRAILER_CARTON;
    a(ms, () => montrer(null));
    ms += 600;
    TRAILER.forEach((p, i) => {
      a(ms, () => montrer(vues[i]));
      ms += p.acte ? TRAILER_ACTE : TRAILER_PLAN;
    });
    a(ms, () => montrer(d.querySelector('#tr-fin')));
    ms += TRAILER_CARTON + 1500;
    a(ms, fin);
  });
}
