/* Lanterval · bande-annonce « Ce qui t'attend pour la suite », jouée à la fin de l'acte 1 (événement ['trailer'] de a1.e10),
   juste avant la fenêtre du verrou de l'acte 2 (moteur/verrou.js). On peut la revoir depuis cette fenêtre.
   Faite avec les panoramas des actes 2 à 4, sans rien révéler des grands retournements : chaque image glisse lentement
   (sur téléphone, en hauteur, on parcourt tout le panorama), avec une phrase dessous. Textes : trailer.* dans interface.txt. */
const TRAILER = [
  ['pano.salvent', 'a2'], ['pano.epave', 'a2'], ['pano.phare', 'a2'],
  ['pano.forgecendre', 'a3'], ['pano.braise', 'a3'],
  ['pano.pont', 'a4'], ['pano.aerie', 'a4'], ['pano.feu', 'a4']
];
const TRAILER_PLAN = 4300;    // durée d'une image (ms)
const TRAILER_CARTON = 2800;  // cartons d'ouverture et de fin (ms)

function trailer() {
  return new Promise(res => {
    const d = document.createElement('div');
    d.className = 'trailer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', t('trailer.titre'));
    d.innerHTML = `<div class="tr-plans">${TRAILER.map(([img, acte], i) => `<div class="tr-plan" data-i="${i}">
        <img alt="" src="${imgSrc(img)}" class="${i % 2 ? 'inv' : ''}">
        <div class="tr-txt"><span>${esc(t('trailer.acte', { n: acte.slice(1) }))} · ${esc(t(acte + '.titre'))}</span><p>${html(t('trailer.' + (i + 1)))}</p></div>
      </div>`).join('')}</div>
      <div class="tr-carton" id="tr-debut"><span>${esc(t('trailer.surtitre'))}</span><h2>${html(t('trailer.titre'))}</h2></div>
      <div class="tr-carton" id="tr-fin"><h2>${html(t('trailer.fin'))}</h2><span>${esc(t('trailer.fin.sous'))}</span></div>
      <button class="tr-passer" type="button">${esc(t('trailer.passer'))}</button>`;
    document.body.appendChild(d);
    SON.musique('theme');
    const plans = [...d.querySelectorAll('.tr-plan')], timers = [];
    let fini = false;
    const a = (ms, f) => timers.push(setTimeout(f, ms));
    const fin = () => {
      if (fini) return; fini = true;
      timers.forEach(clearTimeout);
      d.classList.add('out'); setTimeout(() => d.remove(), 700);
      SON.ambiance();
      res();
    };
    d.querySelector('.tr-passer').onclick = fin;
    let ms = 0;
    a(ms + 100, () => d.querySelector('#tr-debut').classList.add('on'));
    ms += TRAILER_CARTON;
    a(ms, () => d.querySelector('#tr-debut').classList.remove('on'));
    ms += 500;
    plans.forEach((p, i) => {
      a(ms, () => { plans.forEach(x => x.classList.remove('on')); p.classList.add('on'); });
      ms += TRAILER_PLAN;
    });
    a(ms, () => { plans.forEach(x => x.classList.remove('on')); d.querySelector('#tr-fin').classList.add('on'); });
    ms += TRAILER_CARTON + 1200;
    a(ms, fin);
  });
}
