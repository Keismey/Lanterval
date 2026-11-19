/* Lanterval · verrou de l'acte 2 (monétisation : l'acte 1 est gratuit, la suite est payante).
   Le verrou est à l'entrée du Marais salant, seul passage de la vallée vers la côte de Salvent :
   il s'ouvre à la fin de l'acte 1 (a1.e10) et ne contient rien de l'acte 1. Tout le reste de la vallée reste jouable.
   Sur la carte, un cadenas doré marque le marais ; toucher le cadenas, le marais ou un trajet qui le traverse
   ouvre la fenêtre « La suite de l'aventure » (fermable).

   VERROU_ACTIF : false = aucun verrou (tout est gratuit).
   VERROU_ACHAT : false = version de test, la fenêtre propose « Déverrouiller » gratuitement ;
                  true  = 1.1, achat Google Play (à brancher dans acheterActe2).
   Le déblocage est gardé sur l'appareil (clé lanterval-acte2), jamais dans la sauvegarde ni dans son code :
   un code de sauvegarde partagé ne débloque rien (0.10.5 : une sauvegarde importée qui a passé l'acte 1 demande
   le déblocage avant de reprendre, au bouton Continuer et à la Partie+). Les parties déjà avancées sur l'appareil
   avant 0.10.5 (testeurs) sont débloquées une fois pour toutes au premier lancement (acte2Anciens). */
const VERROU_ACTIF = true;
const VERROU_ACHAT = false;
const CLE_ACTE2 = 'lanterval-acte2';
const ZONE_VERROU = 'marais';
const CLE_ACTE2_ANCIENS = 'lanterval-acte2-anciens';

function acte2Achete() { try { return localStorage.getItem(CLE_ACTE2) === '1'; } catch (e) { return false; } }
function acte2Debloquer(oui) { try { if (oui) localStorage.setItem(CLE_ACTE2, '1'); else localStorage.removeItem(CLE_ACTE2); } catch (e) {} }
// la partie a passé le verrou : une étape d'un autre acte finie, la fin vue, une partie+, ou l'équipe déjà au-delà
function acte2DejaJoue() {
  if (!S) return false;
  return S.plus > 0 || (S.finVue || 0) > 0 || S.etapes.some(id => !id.startsWith('a1.'))
    || lieuActuel() === ZONE_VERROU || regionDe(S.loc) !== 'vallee';
}
// le verrou ne se montre qu'une fois le marais ouvert par l'histoire (fin de l'acte 1)
function acte2Verrouille() { return VERROU_ACTIF && !!S && lieuOuvert(ZONE_VERROU) && !acte2Achete(); }
// la sauvegarde a passé l'acte 1 mais la suite n'est pas débloquée sur cet appareil (code de sauvegarde importé)
function acte2Bloque() { return VERROU_ACTIF && !acte2Achete() && acte2DejaJoue(); }
// au premier lancement de 0.10.5 : une partie déjà avancée sur l'appareil reste jouable (testeurs) ;
// la marque est posée une seule fois, donc un code importé ensuite ne profite pas de cette exception
function acte2Anciens() {
  try {
    if (localStorage.getItem(CLE_ACTE2_ANCIENS)) return;
    localStorage.setItem(CLE_ACTE2_ANCIENS, '1');
    if (acte2DejaJoue()) acte2Debloquer(true);
  } catch (e) {}
}
// avant de reprendre une partie (Continuer, Partie+) : true si on peut y aller
async function acte2Passage() { return !acte2Bloque() || await ouvrirVerrou(); }
// fin de l'acte 1 (événement ['trailer'] de a1.e10) : la bande-annonce, puis la fenêtre du verrou si la suite est fermée
async function finActe1() {
  await trailer();
  if (VERROU_ACTIF && !acte2Achete()) await ouvrirVerrou();
}
// un trajet vers dest passe par le marais (ou y mène)
function trajetVerrouille(dest, r) {
  if (!acte2Verrouille()) return false;
  r = r || route(dest);
  return dest === ZONE_VERROU || !!(r && r.via.some(([z]) => z === ZONE_VERROU));
}

// renvoie une promesse tenue quand la fenêtre se ferme (true si la suite a été déverrouillée)
function ouvrirVerrou() {
  return new Promise(res => {
    const achat = VERROU_ACHAT;
    const sh = modal(sheetHead(t('verrou.titre')) + `<div class="verrou-fen">
      <div class="verrou-ic">${ic('lock')}</div>
      ${lignes('verrou.texte').map(l => `<p class="ptext">${html(l)}</p>`).join('')}
      ${achat ? '' : `<p class="note">${html(t('verrou.test'))}</p>`}
    </div><div class="acts">
      <button class="btn main wide" id="v-ok"><span class="ic">${ic('lock')}</span><span class="tx"><span>${esc(t(achat ? 'verrou.acheter' : 'verrou.deverrouiller'))}</span></span></button>
      <button class="btn wide" id="v-trailer"><span class="ic">${ic('play')}</span><span class="tx"><span>${esc(t('verrou.trailer'))}</span></span></button>
      <button class="btn ghost wide" id="v-non"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('verrou.plus.tard'))}</span><small>${esc(t('verrou.plus.tard.sous'))}</small></span></button>
    </div>`);
    sh.querySelector('#mclose').onclick = sh.querySelector('#v-non').onclick = () => { fermerFenetre(); res(false); };
    sh.querySelector('#v-trailer').onclick = async () => { closeModal(); await trailer(); res(await ouvrirVerrou()); };
    sh.querySelector('#v-ok').onclick = () => { if (achat) acheterActe2(); else { acte2Debloquer(true); acte2Ouvert(); res(true); } };
  });
}
function acte2Ouvert() {
  closeModal();
  SON.bruitage('trouve');
  S.msg = tx('verrou.ouvert', { lieu: nomLieu(ZONE_VERROU) });
  if (!busy && !B) renderStable();
}
// 1.1 : achat Google Play Billing, puis acte2Debloquer(true) et acte2Ouvert() quand l'achat est confirmé
function acheterActe2() {}
