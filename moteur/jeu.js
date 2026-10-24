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
  if (S.screen !== 'title') fermerAccueil();
  if (S.screen === 'title') renderTitle();
  else if (S.screen === 'fin') renderFin();
  else if (S.screen === 'map') renderMap();
  else if (LIEUX[lieuActuel()].type === 'village') { S.screen = 'village'; renderVillage(); }
  else { S.screen = 'zone'; renderZone(); }
}

/* ---------- Écran d'accueil et écran titre ----------
   Au lancement : logo Keismey Studio, puis le village en paix et « Touche pour commencer ».
   Ensuite (et à chaque retour au titre) : le village embrumé, sans le cristal, avec les boutons par-dessus ;
   une fois la fin vue, le village reste en paix. Tout est en plein écran, par-dessus le jeu (#accueil). */
let accueilVu = false;
function partieEnCours() { return S && (S.etapes.length > 0 || S.st.time > 0); }
// la fin a été atteinte dans cette partie (les anciennes sauvegardes n'ont que finVue)
function finAtteinte() { return !!S.finPartie || (!!S.finVue && !S.plus); }
// complétion : moitié exploration (découvertes de toutes les zones), moitié quêtes annexes finies
function completion() {
  let n = 0, f = 0;
  for (const id in LIEUX) {
    const L = LIEUX[id];
    if (L.type !== 'zone' || !(L.tresors || []).length || !lieuVisible(id)) continue;
    n += L.tresors.length; f += S.z[id] ? S.z[id].found.length : 0;
  }
  const a = Object.keys(ANNEXES);
  return Math.floor(50 * (n ? f / n : 1) + 50 * a.filter(annexeFinie).length / a.length);
}
function resumePartie() {
  const e = etapeCourante(), plus = S.plus ? ' · ' + t('titre.plus', { n: S.plus }) : '';
  if (finAtteinte() || !e) return t('titre.fin', { p: completion() }) + plus;
  return t('titre.acte', { n: ACTES.findIndex(a => a.etapes.includes(e)) + 1 }) + plus;
}
function accueil() {
  let d = $('#accueil');
  if (d) return d;
  d = document.createElement('div'); d.id = 'accueil'; d.className = 'accueil';
  d.innerHTML = `<img class="fond" alt=""><img class="fond" alt=""><div class="voile"></div><div class="haut"><h1>Lanterval</h1><span></span></div><div class="bas"></div>`;
  document.body.appendChild(d);
  return d;
}
// fondu d'un fond à l'autre
function fondAccueil(d, cle) {
  const [a, b] = d.querySelectorAll('.fond'), vu = a.classList.contains('on') ? a : b.classList.contains('on') ? b : null;
  if (vu && vu.dataset.k === cle) return;
  const autre = vu === a ? b : a, f = IMAGES[cle] || {};
  autre.src = imgSrc(cle); autre.dataset.k = cle; autre.style.objectPosition = f.centre || '';
  autre.classList.add('on'); if (vu) vu.classList.remove('on');
}
function logoStudio() {
  const lg = document.createElement('div'); lg.className = 'lg';
  lg.innerHTML = `<img alt="Keismey Studio" src="img/studio/keismey-studio.webp">`;
  accueil().appendChild(lg);
  setTimeout(passerLogo, 2300);
}
function passerLogo() {
  const lg = $('#accueil .lg'); if (!lg || lg.dataset.parti) return false;
  lg.dataset.parti = 1; lg.style.opacity = 0; setTimeout(() => lg.remove(), 700); return true;
}
function fermerAccueil() { const d = $('#accueil'); if (!d) return; d.id = ''; d.classList.add('out'); setTimeout(() => d.remove(), 600); }

function renderTitle() {
  setDecor('decor.lanterval', { lueur: 'faible' }); ovc().innerHTML = ''; $('#panel').innerHTML = '';
  const d = accueil(), bas = d.querySelector('.bas');
  d.querySelector('.haut span').textContent = t('titre.sous');
  d.classList.toggle('menu', accueilVu);
  if (!accueilVu) {
    fondAccueil(d, 'titre.paix');
    const souris = matchMedia('(hover:hover) and (pointer:fine)').matches;
    bas.innerHTML = `<p class="go">${esc(t(souris ? 'titre.cliquer' : 'titre.toucher'))}</p>`;
    d.onclick = () => { if (passerLogo() || $('#accueil .lg')) return; accueilVu = true; renderTitle(); };
    return;
  }
  d.onclick = null;
  fondAccueil(d, S.finVue ? 'titre.paix' : 'titre.brume');
  let confirmer = null;   // 'new' ou 'plus' : bouton qui attend sa confirmation
  const draw = () => {
    const opts = [];
    if (partieEnCours()) {
      opts.push({ k: 'go', ic: 'play', label: esc(t('titre.continuer')), sub: esc(resumePartie()), cls: 'main' });
      if (S.finVue) opts.push({ k: 'plus', ic: 'star', label: esc(t(confirmer === 'plus' ? 'titre.plus.confirmer' : 'titre.nouvelle.plus')), sub: esc(t('titre.nouvelle.plus.sous')), cls: 'plus' });
      opts.push({ k: 'new', ic: 'x', label: esc(t(confirmer === 'new' ? 'titre.nouvelle.confirmer' : 'titre.nouvelle')), sub: esc(t(confirmer === 'new' ? 'options.reset.confirmer.sous' : 'titre.nouvelle.sous')), cls: confirmer === 'new' ? 'danger' : 'gris' });
    } else opts.push({ k: 'new', ic: 'play', label: esc(t('titre.nouvelle')), cls: 'main' });
    opts.push({ k: 'opt', ic: 'gear', label: esc(t('menu.options')), cls: 'gris' });
    bas.innerHTML = `<div class="acts">${btns(opts)}</div><p class="version">${esc(t('titre.version', { v: VERSION }))}</p>`;
    bind(bas, opts, k => {
      if (k === 'opt') { openOptions(); return; }
      if (k === 'go') { fermerAccueil(); const ici = LIEUX[lieuActuel()]; S.screen = ici.type === 'village' ? 'village' : 'zone'; renderStable(); const f = reprendre(); if (f) run(f); return; }
      if (partieEnCours() && confirmer !== k) { confirmer = k; draw(); return; }
      fermerAccueil();
      if (k === 'plus') partiePlus(); else { effacerPartie(); S = newState(); }
      run(commencer);
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
  ${zones.map(id => `<div class="stat"><b>${pct(id)} %</b><span>${esc(nomLieu(id))}</span></div>`).join('')}<div class="stat"><b>${finies}/${annexes.length}</b><span>${esc(t('stats.annexes'))}</span></div><div class="stat"><b>${completion()} %</b><span>${esc(t('stats.completion'))}</span></div></div>
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
  if (passerLogo()) return;
  if (S && S.screen === 'title' && !accueilVu) { accueilVu = true; renderTitle(); return; }
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
  logoStudio();
  $('#app').classList.add('pret');
})();
