/* Lanterval · textes : lecture des fichiers textes/<langue>/*.txt, langue, texte lettre par lettre.

   Format d'un fichier : « == repère » ouvre un texte, chaque ligne suivante est une bulle,
   « # » en début de ligne est une note ignorée. Voir l'aide en tête de textes/fr/acte1.txt. */

const FICHIERS_TEXTES = ['interface', 'noms', 'lieux', 'acte1', 'annexes'];
const LANGUES = ['fr', 'en'];
const TXT = { fr: {}, en: {} };
let LANG = 'fr';
let PARLE = {};   // nom écrit avant « : » → id du personnage (portrait)

function lireTexte(src, dest) {
  let cle = null;
  for (const brut of src.split(/\r?\n/)) {
    const l = brut.trim();
    if (!l || l.startsWith('#') && !l.startsWith('##')) continue;
    const m = /^==\s*(\S+)\s*$/.exec(l);
    if (m) { cle = m[1]; dest[cle] = []; continue; }
    if (cle) dest[cle].push(l);
  }
}

async function chargerTextes() {
  const inline = window.LV_TEXTES || null;   // l'aperçu privé embarque les textes dans la page
  await Promise.all(LANGUES.flatMap(lg => FICHIERS_TEXTES.map(async f => {
    let src = inline ? inline[lg + '/' + f] : null;
    if (src == null && !inline) src = await fetch(`textes/${lg}/${f}.txt`).then(r => r.ok ? r.text() : '').catch(() => '');
    if (src) lireTexte(src, TXT[lg]);
  })));
}

function choisirLangue(lg) {
  LANG = LANGUES.includes(lg) ? lg : 'fr';
  document.documentElement.lang = LANG;
  PARLE = {};
  for (const k of Object.keys(TXT.fr)) if (k.startsWith('parle.')) PARLE[t(k)] = k.slice(6);
}

// lignes d'un repère, dans la langue choisie, sinon en français
function lignes(cle) { return TXT[LANG][cle] || TXT.fr[cle] || null; }
function existe(cle) { return !!lignes(cle); }
function remplir(s, v) { return v ? s.replace(/\{(\w+)\}/g, (m, k) => v[k] !== undefined ? v[k] : m) : s; }
// texte brut d'un repère (les lignes jointes) ; un repère manquant s'affiche entre crochets
function t(cle, v) {
  const l = lignes(cle);
  if (!l) { console.warn('Texte manquant :', cle); return '⟦' + cle + '⟧'; }
  return remplir(l.filter(x => !x.startsWith('##')).join(' '), v);
}
// mise en forme : *gras*, puis HTML sûr
function html(s) { return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>'); }
function tx(cle, v) { return html(t(cle, v)); }
// accord simple : pl(n, 'combat', 'combats')
function pl(n, un, plusieurs) { return n > 1 ? plusieurs : un; }

// Une bulle : qui parle, le texte, le bouton éventuel
function bulle(ligne) {
  let texte = ligne, bouton = null, qui = null, nom = null;
  const b = /\s*\[([^\]]+)\]\s*$/.exec(texte);
  if (b) { bouton = b[1]; texte = texte.slice(0, b.index); }
  const m = /^([^:«»*]{1,28}?)\s?:\s(.+)$/.exec(texte);
  if (m && PARLE[m[1]]) { nom = m[1]; qui = PARLE[m[1]]; texte = m[2]; }
  return { qui, nom, texte, bouton };
}

/* Texte lettre par lettre. Tout le texte est posé dès le début (la partie pas encore écrite reste invisible) :
   la mise en page ne bouge pas et les boutons restent à leur place. Un appui n'importe où affiche tout d'un coup,
   sans déclencher de bouton. Un texte identique au précédent s'affiche directement. */
let TW = null, DERNIER_TEXTE = '';
function typeIn(root) {
  if (TW) TW();
  const zones = [...root.querySelectorAll('.ptext')];
  const cle = zones.map(e => e.textContent).join('|');
  const deja = cle === DERNIER_TEXTE;
  DERNIER_TEXTE = cle;
  if (deja || OPT.texte === 'instant' || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const morceaux = [];
  for (const e of zones) {
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), noeuds = [];
    let n; while ((n = w.nextNode())) if (n.nodeValue.trim()) noeuds.push(n);
    for (const n of noeuds) {
      const v = n.nodeValue, vu = document.createTextNode(''), cache = document.createElement('span');
      cache.className = 'tw-cache'; cache.textContent = v;
      n.replaceWith(vu, cache);
      morceaux.push([vu, cache, v]);
    }
  }
  if (!morceaux.length) return;
  const k = OPT.texte === 'rapide' ? .4 : 1;
  let i = 0, c = 0, tm;
  const eat = e => { e.preventDefault(); e.stopPropagation(); };
  const end = () => {
    clearTimeout(tm);
    for (const [vu, cache, v] of morceaux) { vu.nodeValue = v; cache.remove(); }
    document.removeEventListener('pointerdown', skip, true); TW = null;
  };
  const skip = e => {
    if (e.target.closest && e.target.closest('#hud,#modal,#ks-dlg')) return;
    eat(e); end();
    document.addEventListener('click', eat, { capture: true, once: true });
    setTimeout(() => document.removeEventListener('click', eat, true), 500);
  };
  const tick = () => {
    if (i >= morceaux.length) return end();
    const [vu, cache, v] = morceaux[i], ch = v[c++];
    vu.nodeValue = v.slice(0, c); cache.textContent = v.slice(c);
    if (c >= v.length) { cache.remove(); i++; c = 0; }
    tm = setTimeout(tick, (/[.!?…]/.test(ch) ? 160 : /[,;:]/.test(ch) ? 80 : 20) * k);
  };
  document.addEventListener('pointerdown', skip, true); TW = end; tick();
}
