/* Lanterval · mode test, pour vérifier une étape sans rejouer tout le début.
   Il s'ouvre avec ?debug=1 dans l'adresse (bouton « Mode test » dans les Options), jamais sur le site public (keismey.github.io).
   Outil de développement : ses libellés restent en français. */

// L'aperçu privé (window.LV_APERCU) l'a aussi, pour tester vite.
const DEBUG = (/[?&]debug=1\b/.test(location.search) || !!window.LV_APERCU) && location.hostname !== 'keismey.github.io';

// repart d'une nouvelle partie et joue en silence toutes les étapes avant celle choisie
async function sauterA(cible) {
  const plus = S ? S.plus : 0;
  S = newState(); S.plus = plus; S.screen = 'village';
  await jouer(ACTES[0].ouverture, { silencieux: true });
  for (const e of toutesEtapes()) {
    if (e.id === cible) break;
    await jouerEtape(e, true);
  }
  for (const h of team()) { h.lvl = Math.max(h.lvl, 1 + toutesEtapes().findIndex(e => e.id === cible)); fullC(h); }
  const e = etapeCourante(), v = e && villageDuPnj(e.lieu);
  S.loc = v || (e ? (LIEUX[e.lieu] && LIEUX[e.lieu].cotes ? e.lieu + '.' + LIEUX[e.lieu].cotes[0] : e.lieu) : 'lanterval');
  S.screen = LIEUX[lieuActuel()].type === 'village' ? 'village' : 'zone';
  S.msg = `Mode test : début de l'étape ${cible}.`;
}

function openDebug() {
  const ici = S && S.screen !== 'title' ? lieuActuel() : null;
  const o = toutesEtapes().map(e => ({ k: 'e:' + e.id, ic: 'star', label: esc(e.id + ' · ' + t(e.id + '.titre')), sub: esc('Recommencer ici · lieu : ' + e.lieu) }));
  o.push({ k: 'or', ic: 'coin', label: '+200 po' });
  o.push({ k: 'niv', ic: 'users', label: '+2 niveaux pour toute l\'équipe' });
  o.push({ k: 'soin', ic: 'heart', label: 'Soigner l\'équipe' });
  o.push({ k: 'objets', ic: 'bag', label: '+5 de chaque objet de soin' });
  if (ici && S.z[ici]) o.push({ k: 'zone', ic: 'search', label: 'Explorer cette zone à 100 %' });
  for (const a in ANNEXES) o.push({ k: 'a:' + a, ic: 'paw', label: `Quête annexe ${a} : étape suivante`, sub: `état actuel : ${S ? annexeEtat(a) : 0}` });
  o.push({ k: 'fin', ic: 'book', label: 'Écran de fin du jeu', sub: 'Ses boutons ramènent à Aerie avant l\'Escalier' });
  o.push({ k: 'plus', ic: 'play', label: 'Lancer une partie+' });
  const sh = modal(sheetHead('Mode test') + `<p class="note">Les étapes d'avant sont jouées en silence. Rien de tout ça n'est possible sur le site public.</p><div class="acts" id="d-list"></div>`);
  sh.querySelector('#mclose').onclick = fermerFenetre;
  const el = sh.querySelector('#d-list'); el.innerHTML = btns(o);
  bind(el, o, k => run(async () => {
    closeModal();
    if (!S) S = newState();
    if (k.startsWith('e:')) await sauterA(k.slice(2));
    else if (k === 'or') S.gold += 200;
    else if (k === 'niv') for (const h of team()) { h.lvl += 2; fullC(h); }
    else if (k === 'soin') { healAll(); restorePP(); }
    else if (k === 'objets') for (const id in OBJETS) addItem(id, 5);
    else if (k === 'zone') { const z = S.z[ici]; z.found = LIEUX[ici].tresors.map(f => f.id); z.m50 = z.m100 = true; }
    else if (k.startsWith('a:')) { const a = k.slice(2); S.annexes[a] = Math.min(annexeEtat(a) + 1, ANNEXES[a].etapes.length + 1); delete S.morceaux[a]; }
    else if (k === 'fin') S.screen = 'fin';
    else if (k === 'plus') { partiePlus(); await commencer(); }
  }));
}
