/* Lanterval · verrou de l'acte 2 (monétisation : l'acte 1 est gratuit, la suite est payante).
   Le verrou est à l'entrée du Marais salant, seul passage de la vallée vers la côte de Salvent :
   il s'ouvre à la fin de l'acte 1 (a1.e10) et ne contient rien de l'acte 1. Tout le reste de la vallée reste jouable.
   Sur la carte, un cadenas doré marque le marais ; toucher le cadenas, le marais ou un trajet qui le traverse
   ouvre la fenêtre « La suite de l'aventure » (fermable).

   VERROU_ACTIF : false = aucun verrou (tout est gratuit).
   VERROU_ACHAT : false = version de test, la fenêtre propose « Déverrouiller » gratuitement ;
                  true  = 1.1, achat Google Play (à brancher dans acheterActe2).
   Le déblocage est gardé sur l'appareil (clé lanterval-acte2), jamais dans la sauvegarde ni dans son code :
   un code de sauvegarde partagé ne débloque rien. Une partie qui a déjà joué l'acte 2 (testeurs, partie+)
   n'est jamais bloquée en arrière. */
const VERROU_ACTIF = true;
const VERROU_ACHAT = false;
const CLE_ACTE2 = 'lanterval-acte2';
const ZONE_VERROU = 'marais';

function acte2Achete() { try { return localStorage.getItem(CLE_ACTE2) === '1'; } catch (e) { return false; } }
function acte2Debloquer(oui) { try { if (oui) localStorage.setItem(CLE_ACTE2, '1'); else localStorage.removeItem(CLE_ACTE2); } catch (e) {} }
// la partie a déjà passé le verrou : une étape d'un autre acte finie, la fin vue, une partie+, ou l'équipe déjà au-delà
function acte2DejaJoue() {
  if (!S) return false;
  return S.plus > 0 || (S.finVue || 0) > 0 || S.etapes.some(id => !id.startsWith('a1.'))
    || lieuActuel() === ZONE_VERROU || regionDe(S.loc) !== 'vallee';
}
// le verrou ne se montre qu'une fois le marais ouvert par l'histoire (fin de l'acte 1)
function acte2Verrouille() { return VERROU_ACTIF && !!S && lieuOuvert(ZONE_VERROU) && !acte2Achete() && !acte2DejaJoue(); }
// un trajet vers dest passe par le marais (ou y mène)
function trajetVerrouille(dest, r) {
  if (!acte2Verrouille()) return false;
  r = r || route(dest);
  return dest === ZONE_VERROU || !!(r && r.via.some(([z]) => z === ZONE_VERROU));
}

function ouvrirVerrou() {
  const achat = VERROU_ACHAT;
  const sh = modal(sheetHead(t('verrou.titre')) + `<div class="verrou-fen">
    <div class="verrou-ic">${ic('lock')}</div>
    ${lignes('verrou.texte').map(l => `<p class="ptext">${html(l)}</p>`).join('')}
    ${achat ? '' : `<p class="note">${html(t('verrou.test'))}</p>`}
  </div><div class="acts">
    <button class="btn main wide" id="v-ok"><span class="ic">${ic('lock')}</span><span class="tx"><span>${esc(t(achat ? 'verrou.acheter' : 'verrou.deverrouiller'))}</span></span></button>
    <button class="btn ghost wide" id="v-non"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('verrou.plus.tard'))}</span><small>${esc(t('verrou.plus.tard.sous'))}</small></span></button>
  </div>`);
  sh.querySelector('#mclose').onclick = sh.querySelector('#v-non').onclick = fermerFenetre;
  sh.querySelector('#v-ok').onclick = () => { if (achat) acheterActe2(); else { acte2Debloquer(true); acte2Ouvert(); } };
}
function acte2Ouvert() {
  closeModal();
  SON.bruitage('trouve');
  S.msg = tx('verrou.ouvert', { lieu: nomLieu(ZONE_VERROU) });
  if (!busy && !B) renderStable();
}
// 1.1 : achat Google Play Billing, puis acte2Debloquer(true) et acte2Ouvert() quand l'achat est confirmé
function acheterActe2() {}
