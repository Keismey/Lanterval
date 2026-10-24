/* Lanterval · démarrage, écran titre, enchaînement des écrans, défaite, fin de version. */

// Lance une séquence (dialogue, combat, trajet…) ; une seule à la fois. Une défaite ramène à l'auberge.
async function run(fn) {
  if (busy) return;
  busy = true;
  try { await fn(); }
  catch (e) { if (e === DEFAITE) { B = null; await defaite(); } else console.error(e); }
  finally { busy = false; }
  renderStable();
}
async function defaite() {
  // dans le final, l'équipe se relève au dernier palier de l'Escalier, sans perdre d'or,
  // et l'étape reprend au combat perdu (Ysold vaincue ne se rejoue pas si la Paupière l'emporte)
  if (dansLeFinal()) {
    healAll(); restorePP();
    S.loc = fini(FINAL.palier) ? 'escalier.s' : 'escalier.b'; S.screen = 'zone';
    logR('journal.log.releve');
    setDecor(decorDuLieu('escalier')); ovc().innerHTML = '';
    await show(tx('defaite.escalier'), { title: t('defaite.titre') });
    return;
  }
  S.reprise = null; // l'étape perdue se rejoue depuis le début
  S.gold = Math.floor(S.gold / 2); healAll(); restorePP();
  const v = S.auberge && LIEUX[S.auberge] ? S.auberge : 'lanterval';   // l'auberge du dernier village visité
  S.loc = v; S.screen = 'village';
  logR('journal.log.retour', { lieu: 'lieu.' + v + '.nom' });
  setDecor(decorDuLieu(v), { lueur: lueurDuLieu(v) }); ovc().innerHTML = '';
  await show(tx('defaite.texte', { or: S.gold, lieu: nomLieu(v) }), { title: t('defaite.titre') });
}

// affiche l'écran stable de la partie (là où le joueur choisit quoi faire)
function renderStable() {
  $('#app').classList.remove('inb');
  if (!S) S = newState();
  // la fin vue (écran fermé, ou partie reprise depuis le titre) : la partie revient à Aerie avant l'Escalier
  if (!['title', 'fin', 'intro'].includes(S.screen) && dansLeFinal() && fini(FINAL.fin)) retourAvantFinal();
  hud();
  if (S.screen !== 'title') save();
  if (S.screen === 'title') renderTitle();
  else if (S.screen === 'fin') renderFin();
  else if (S.screen === 'map') renderMap();
  else if (LIEUX[lieuActuel()].type === 'village') { S.screen = 'village'; renderVillage(); }
  else { S.screen = 'zone'; renderZone(); }
}

/* ---------- Écran titre ---------- */
function partieEnCours() { return S && (S.etapes.length > 0 || S.st.time > 0); }
function renderTitle() {
  setDecor('decor.lanterval', { lueur: 'faible' });
  ovc().innerHTML = `<div class="titre"><h1>Lanterval</h1><span>${esc(t('titre.sous'))}</span></div>`;
  let confirmer = false;
  const draw = () => {
    const opts = [];
    if (partieEnCours()) {
      const e = etapeCourante();
      opts.push({ k: 'go', ic: 'play', label: esc(t('titre.continuer')), sub: esc((e ? t(e.id + '.titre') : t('journal.tout.fini')) + ' · ' + fmt(S.st.time) + (S.plus ? ' · ' + t('titre.plus', { n: S.plus }) : '') + (S.finVue ? ' · ' + t('titre.finvue') : '')), cls: 'main' });
      opts.push({ k: 'new', ic: 'star', label: esc(t(confirmer ? 'titre.nouvelle.confirmer' : 'titre.nouvelle')), sub: esc(t(confirmer ? 'options.reset.confirmer.sous' : 'titre.nouvelle.sous')), cls: confirmer ? 'danger' : 'ghost' });
    } else opts.push({ k: 'new', ic: 'play', label: esc(t('titre.commencer')), sub: esc(t('titre.commencer.sous')), cls: 'main' });
    const p = $('#panel');
    p.innerHTML = `<p class="ptext">${tx('titre.texte')}</p><div class="acts">${btns(opts)}</div><p class="note centre">${esc(t('titre.version', { v: VERSION }))}</p>`;
    bind(p, opts, k => {
      if (k === 'go') { const ici = LIEUX[lieuActuel()]; S.screen = ici.type === 'village' ? 'village' : 'zone'; renderStable(); const f = reprendre(); if (f) run(f); return; }
      if (partieEnCours() && !confirmer) { confirmer = true; draw(); return; }
      effacerPartie(); S = newState(); run(commencer);
    });
  };
  draw();
}
// nouvelle partie (ou partie+) : la scène d'ouverture, puis le village
async function commencer() {
  S.screen = 'intro';
  await jouer(ACTES[0].ouverture, { titre: t(ACTES[0].id + '.titre') });
  S.screen = 'village';
}

/* ---------- Fin du jeu ---------- */
// après le générique : le bilan de la partie, puis retour à Aerie avant l'Escalier, partie+ ou écran titre
function renderFin() {
  setDecor('pano.oeil', { pano: true });
  ovc().innerHTML = '';
  const st = S.st, zones = Object.keys(S.z).filter(lieuVisible);
  const annexes = Object.keys(ANNEXES), finies = annexes.filter(annexeFinie).length;
  const reste = annexes.length - finies;
  const opts = [
    { k: 'go', ic: 'run', label: esc(t('fin.continuer')), sub: esc(t(reste ? 'fin.continuer.annexes' : 'fin.continuer.zones', { n: reste })), cls: 'main' },
    { k: 'plus', ic: 'star', label: esc(t('fin.plus')), sub: esc(t('fin.plus.sous')) },
    { k: 'titre', ic: 'home', label: esc(t('options.titre')), cls: 'ghost' }
  ];
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(t('fin.titre'))}</div><p class="ptext">${tx('fin.texte')}</p><p class="ptext">${encadreTuto(tx('fin.astuce'))}</p>
  <div class="stats"><div class="stat"><b>${fmt(st.time)}</b><span>${esc(t('stats.temps'))}</span></div><div class="stat"><b>${st.taps}</b><span>${esc(t('stats.appuis'))}</span></div>
  <div class="stat"><b>${st.fights}</b><span>${esc(t('stats.combats.quete', { n: st.qfights }))}</span></div><div class="stat"><b>${st.autoTurns}</b><span>${esc(t('stats.auto'))}</span></div>
  <div class="stat"><b>${st.explores}</b><span>${esc(t('stats.explorations'))}</span></div><div class="stat"><b>${st.trav}</b><span>${esc(t('stats.traversees'))}</span></div>
  ${zones.map(id => `<div class="stat"><b>${pct(id)} %</b><span>${esc(nomLieu(id))}</span></div>`).join('')}<div class="stat"><b>${finies}/${annexes.length}</b><span>${esc(t('stats.annexes'))}</span></div></div>
  <h3 class="sec">${esc(t('fin.chronologie'))}</h3><div class="log">${st.log.map(ligneJournal).join('')}</div>
  <div class="acts">${btns(opts)}</div>`;
  bind(p, opts, k => {
    if (k === 'plus') { partiePlus(); run(commencer); return; }
    retourAvantFinal();
    if (k === 'titre') S.screen = 'title';
    save(); renderStable();
  });
}

/* ---------- Temps de jeu, appuis, bouton retour ---------- */
document.addEventListener('click', e => { if (S && S.screen !== 'title' && e.target.closest('button')) S.st.taps++; }, true);
setInterval(() => {
  if (!S || S.screen === 'title' || document.hidden) return;
  S.st.time++;
}, 1000);
window.addEventListener('pagehide', () => { if (S && S.screen !== 'title' && S.screen !== 'intro') save(); });

// Bouton retour du téléphone (et touche Échap) : on remonte d'un cran à la fois.
// fenêtre ouverte → son écran précédent, ou on la ferme ; menu avec un bouton « Retour » (boutique, combat, carte…) → ce bouton ;
// dialogue ou combat en cours → rien ; écran de jeu → proposer l'écran titre ; écran titre → proposer le hub.
function retour() {
  if (KS.closeDialog()) return;
  if (modalOuverte()) {
    if (TW) TW();
    const m = $('#modal'), b = m.querySelector('#m-back') || [...m.querySelectorAll('button[data-back]')].pop() || m.querySelector('#mclose');
    if (b && !b.disabled) b.click(); else fermerFenetre();
    return;
  }
  if ($('#spl')) { passerSplash(); return; }
  const rb = [...$('#panel').querySelectorAll('button[data-back]')].filter(b => !b.disabled).pop();
  if (rb) { if (TW) TW(); rb.click(); return; }
  if (busy || B || !S) return;
  if (S.screen === 'title') { confirmer('retour.hub', () => KSBack.toHub()); return; }
  if (S.screen === 'map') { S.screen = LIEUX[lieuActuel()].type === 'village' ? 'village' : 'zone'; renderStable(); return; }
  confirmer('retour.titre', () => { save(); S.screen = 'title'; renderStable(); });
}
// petite fenêtre « Oui / Non » ; le bouton retour la ferme (Non)
function confirmer(cle, oui) {
  const sh = modal(sheetHead(t(cle)) + `<p class="ptext">${tx(cle + '.texte')}</p><div class="acts">
    <button class="btn main wide" id="m-oui"><span class="tx"><span>${esc(t(cle + '.oui'))}</span></span></button>
    <button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour.rester'))}</span></span></button></div>`);
  sh.querySelector('#mclose').onclick = sh.querySelector('#m-back').onclick = closeModal;
  sh.querySelector('#m-oui').onclick = () => { closeModal(); oui(); };
}

/* ---------- Écran d'accueil : logo Keismey Studio, puis l'image du jeu « Touche pour commencer » ---------- */
function splash() {
  const d = document.createElement('div'), fin = matchMedia('(hover:hover) and (pointer:fine)').matches;
  d.id = 'spl';
  d.innerHTML = `<div class="tt"><img class="fond" alt="" src="${imgSrc('pano.ouverture')}"><div class="haut"><h1>Lanterval</h1><span>${esc(t('titre.sous'))}</span></div>
    <img class="pano" alt="" src="${imgSrc('pano.ouverture')}"><p class="go">${esc(t(fin ? 'titre.cliquer' : 'titre.toucher'))}</p></div>
    <div class="lg"><img alt="Keismey Studio" src="img/studio/keismey-studio.webp"></div>`;
  document.body.appendChild(d);
  setTimeout(passerLogo, 2300);
  d.addEventListener('click', e => { e.stopPropagation(); passerSplash(); });
}
function passerLogo() { const d = $('#spl'); if (!d || d.dataset.etape) return false; d.dataset.etape = 'titre'; const lg = d.querySelector('.lg'); lg.style.opacity = 0; setTimeout(() => lg.remove(), 700); return true; }
function passerSplash() {
  const d = $('#spl'); if (!d || passerLogo() || d.dataset.etape === 'fin') return;
  d.dataset.etape = 'fin'; d.classList.add('out'); setTimeout(() => d.remove(), 650);
}

/* ---------- Démarrage ---------- */
(async function demarrer() {
  chargerOptions();
  const q = new URLSearchParams(location.search).get('lang');
  if (q) { OPT.lang = q; sauverOptions(); }
  await chargerTextes();
  choisirLangue(OPT.lang || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'));
  dessinerSprites();
  S = loadSave() || newState();
  S.screen = 'title';
  KSBack.init({ back: retour, lang: () => LANG });
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  renderStable();
  splash();
  $('#app').classList.add('pret');
})();
