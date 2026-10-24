/* Lanterval · musique et bruitages.
   La musique : fichiers de son/ (donnees/musiques.js), lus en entier puis joués par le navigateur ;
   chaque piste boucle en fondu enchaîné, et passe à la suivante en fondu.
   Les bruitages : fabriqués à la volée (Web Audio), aucun fichier.
   Le son démarre au premier appui (les navigateurs l'exigent) et se coupe quand le jeu passe en arrière-plan.
   Volumes : OPT.musique et OPT.bruitages, de 0 (coupé) à 10. */

const SON = (() => {
  let ctx = null, gMus = null, gSfx = null, voix = null, voulue = null, bruit = null;
  const urls = {};            // piste → adresse du fichier déjà chargé (blob)
  const niveau = v => Math.pow(Math.max(0, Math.min(10, v)) / 10, 1.6);

  function volumes() {
    if (!ctx) return;
    gMus.gain.setTargetAtTime(niveau(OPT.musique) * .9, ctx.currentTime, .05);
    gSfx.gain.setTargetAtTime(niveau(OPT.bruitages) * .55, ctx.currentTime, .05);
  }
  function demarrer() {
    if (ctx) { if (ctx.state === 'suspended' && !document.hidden) ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    gMus = ctx.createGain(); gMus.connect(ctx.destination);
    gSfx = ctx.createGain(); gSfx.connect(ctx.destination);
    gMus.gain.value = gSfx.gain.value = 0;
    volumes();
    const n = ctx.sampleRate; bruit = ctx.createBuffer(1, n, n);
    const d = bruit.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    if (voulue) { const p = voulue; voulue = null; musique(p); }
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => document.addEventListener(ev, demarrer, true));
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });

  /* ---------- Musique ---------- */
  // la piste réellement jouée : la première de la chaîne `sinon` qui a un fichier
  function resoudre(id) { const vu = {}; while (id && MUSIQUES[id] && !MUSIQUES[id].fichier && !vu[id]) { vu[id] = 1; id = MUSIQUES[id].sinon; } return id && MUSIQUES[id] && MUSIQUES[id].fichier ? id : null; }
  async function charger(id) {
    if (urls[id]) return urls[id];
    const r = await fetch(MUSIQUES[id].fichier); if (!r.ok) throw new Error(r.status);
    return (urls[id] = URL.createObjectURL(await r.blob()));
  }
  // une voix = un lecteur audio branché sur le volume de la musique, avec son propre fondu
  function nouvelleVoix(id, url) {
    const el = new Audio(); el.src = url; el.preload = 'auto';
    const src = ctx.createMediaElementSource(el), g = ctx.createGain();
    g.gain.value = 0; src.connect(g); g.connect(gMus);
    const v = { id, el, g, fin: false };
    el.addEventListener('timeupdate', () => {
      if (v.fin || voix !== v || !el.duration) return;
      const fin = MUSIQUES[id].fin || el.duration;
      if (el.currentTime >= fin - FONDU_BOUCLE) { boucler(v, url); }
    });
    el.addEventListener('ended', () => { if (voix === v && !v.fin) boucler(v, url); });
    return v;
  }
  function fondu(v, vers, duree) { const t = ctx.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(vers, t + duree); }
  function arreter(v, duree) { v.fin = true; fondu(v, 0, duree); setTimeout(() => { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); v.g.disconnect(); }, duree * 1000 + 100); }
  function boucler(v, url) { const n = nouvelleVoix(v.id, url); voix = n; n.el.play().catch(() => {}); fondu(n, 1, FONDU_BOUCLE * .6); arreter(v, FONDU_BOUCLE); }
  let demande = 0;
  async function musique(id) {
    const p = resoudre(id);
    if (!ctx) { voulue = id; return; }
    if (voix && !voix.fin && voix.id === p) return;
    const n = ++demande;
    if (voix) { arreter(voix, .9); voix = null; }
    if (!p) return;
    let url; try { url = await charger(p); } catch (e) { return; }
    if (n !== demande) return;   // une autre piste a été demandée pendant le chargement
    const v = nouvelleVoix(p, url); voix = v;
    v.el.play().catch(() => {}); fondu(v, 1, 1.2);
  }
  // la musique du lieu où se trouve l'équipe
  function ici() {
    if (!S || ['title', 'intro'].includes(S.screen)) return 'theme';
    if (S.screen === 'fin') return 'epilogue';
    if (S.screen === 'map') return 'voyage';
    const id = lieuActuel(), L = LIEUX[id];
    if (L.type === 'village') return id === 'lanterval' && etatLieu(id) !== 'fete' ? 'brume' : MUSIQUES[id] ? id : 'lanterval';
    if (MUSIQUES[id]) return id;
    return regionDe(S.loc);
  }
  function ambiance() { musique(ici()); }
  // un panorama de récit peut changer la musique (émotion, menace, épilogue) jusqu'au retour au lieu
  function panorama(id) { const m = PANO_MUSIQUE[String(id).replace(/^pano\./, '')]; if (m) musique(m); }
  function combat(ids, o) { musique(ids.some(id => MUSIQUE_FINAL.includes(id)) ? 'final' : o.boss ? 'boss' : 'combat'); }

  /* ---------- Bruitages ---------- */
  // une note : fréquence (ou [début, fin] pour un glissé), durée, forme d'onde, volume, départ
  function note(f, dur, type = 'sine', vol = .3, at = 0, att = .005) {
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    if (Array.isArray(f)) { o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + dur); } else o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    o.connect(g); g.connect(gSfx); o.start(t); o.stop(t + dur + .02);
  }
  // un souffle filtré : fréquence du filtre (ou [début, fin]), durée, type de filtre, volume, départ
  function souffle(f, dur, filtre = 'bandpass', vol = .3, at = 0, q = 1, att = .005) {
    const t = ctx.currentTime + at, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = bruit; s.loop = true; fl.type = filtre; fl.Q.value = q;
    if (Array.isArray(f)) { fl.frequency.setValueAtTime(f[0], t); fl.frequency.exponentialRampToValueAtTime(f[1], t + dur); } else fl.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(fl); fl.connect(g); g.connect(gSfx); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
  }
  const arpege = (fs, pas, dur, type, vol, at = 0) => fs.forEach((f, i) => note(f, dur, type, vol, at + i * pas));
  // petites voix pour les jingles : [fréquence, départ, durée]
  const cuivre = ns => ns.forEach(([f, at, d]) => { note(f, d + .08, 'sawtooth', .045, at, .02); note(f, d + .08, 'square', .03, at, .02); note(f / 2, d + .08, 'triangle', .06, at, .02); });
  const flute = ns => ns.forEach(([f, at, d]) => { note(f, d + .1, 'sine', .16, at, .04); note(f * 2, d, 'sine', .02, at, .04); });
  const harpe = (fs, at, pas) => fs.forEach((f, i) => { note(f, .9, 'triangle', .09, at + i * pas, .002); note(f * 2, .4, 'sine', .03, at + i * pas, .002); });
  const accord = (fs, at, d, vol = .06) => fs.forEach(f => note(f, d, 'triangle', vol, at, .03));
  const BRUITS = {
    clic: () => note([900, 700], .05, 'triangle', .16),
    valider: () => { note(660, .06, 'triangle', .16); note(990, .09, 'triangle', .14, .045); },
    page: () => note(1250, .03, 'sine', .06),
    ouvre: () => note([420, 840], .09, 'triangle', .13),
    ferme: () => note([760, 380], .08, 'triangle', .11),
    erreur: () => { note(196, .08, 'square', .06); note(165, .12, 'square', .06, .09); },
    coup: () => { souffle([2400, 500], .1, 'bandpass', .5, 0, 1.2); note([150, 55], .12, 'sine', .45); },
    faiblesse: () => { souffle([3000, 600], .12, 'bandpass', .55, 0, 1.2); note([180, 60], .14, 'sine', .5); note(1568, .18, 'triangle', .16, .02); note(2093, .22, 'triangle', .12, .07); },
    resiste: () => { souffle(380, .12, 'lowpass', .45); note([110, 70], .1, 'sine', .25); },
    brise: () => { souffle(5000, .35, 'highpass', .35); [2637, 3136, 3951, 4699].forEach((f, i) => note(f, .4 - i * .05, 'sine', .1, i * .025)); note([200, 60], .2, 'sine', .4); },
    vaincu: () => { note([440, 70], .4, 'sawtooth', .07); souffle([1200, 200], .45, 'lowpass', .2, .05); },
    recu: () => { souffle(900, .12, 'lowpass', .45); note([120, 50], .15, 'sine', .5); },
    ko: () => note([330, 98], .5, 'triangle', .22),
    rate: () => souffle([1800, 3200], .15, 'bandpass', .14, 0, 2),
    soin: () => { arpege([1047, 1319, 1568, 2093], .06, .35, 'sine', .12); souffle(6000, .5, 'highpass', .05, .05, 1, .15); },
    bonus: () => arpege([784, 988, 1175], .05, .25, 'triangle', .1),
    elT: () => { note([90, 45], .45, 'sine', .55); souffle([500, 120], .45, 'lowpass', .5, 0, 1, .02); },
    elF: () => { souffle([400, 2600], .32, 'bandpass', .45, 0, 1.5, .03); for (let i = 0; i < 5; i++) souffle(3000 + Math.random() * 2000, .03, 'bandpass', .2, .05 + Math.random() * .3, 3); },
    elE: () => { for (let i = 0; i < 4; i++) note([300 + i * 90, 900 + i * 150], .09, 'sine', .2, i * .07); souffle(1500, .35, 'lowpass', .12); },
    elV: () => souffle([500, 3200], .45, 'bandpass', .4, 0, 3, .12),
    union: () => { arpege([392, 523, 659, 784], .04, .5, 'sawtooth', .05); souffle([800, 4000], .5, 'bandpass', .2, 0, 1, .1); },
    or: () => { note(1568, .07, 'square', .06); note(2093, .2, 'square', .06, .06); },
    trouve: () => arpege([784, 988, 1175, 1568], .07, .3, 'triangle', .13),
    palier: () => { arpege([523, 659, 784, 1047, 1319], .08, .5, 'triangle', .13); note(2093, .8, 'sine', .07, .4); },
    niveau: () => { arpege([523, 659, 784], .07, .2, 'square', .06); [1047, 1319, 1568].forEach(f => note(f, .7, 'triangle', .1, .24)); },
    // jingles : de courtes phrases jouées par-dessus la musique, qui s'efface un instant
    victoire: () => { cuivre([[523, 0, .1], [523, .12, .1], [523, .24, .1], [523, .36, .3], [415, .7, .3], [466, 1.02, .3], [523, 1.34, .25], [466, 1.62, .1], [523, 1.74, 1.1]]); accord([262, 330, 392], 1.74, 1.2); harpe([1047, 1319, 1568, 2093], 1.8, .06); },
    defaite: () => { flute([[440, 0, .5], [415, .5, .5], [392, 1, .5], [330, 1.5, 1.4]]); accord([220, 262, 330], 1.5, 1.6, .05); },
    quete: () => { harpe([523, 659, 784, 1047, 1319, 1568, 2093], 0, .05); cuivre([[784, .4, .25], [1047, .66, .25], [988, .92, .2], [1047, 1.12, 1]]); accord([523, 659, 784], 1.12, 1.2); },
    objet: () => { harpe([587, 740, 880, 1175, 1480, 1760, 2349], 0, .045); note(2349, 1.4, 'sine', .08, .4, .05); note(2960, 1.2, 'sine', .05, .5, .05); accord([587, 740, 880], .35, 1.3, .05); },
    auberge: () => { [784, 659, 587, 523, 587, 659, 523].forEach((f, i) => { note(f, .6, 'sine', .14, i * .32); note(f * 2, .3, 'sine', .03, i * .32); }); flute([[523, 2.6, .18], [659, 2.8, .18], [784, 3, .18], [1047, 3.2, .7]]); }
  };
  const DUREE_JINGLE = { victoire: 2.6, defaite: 2.8, quete: 2.2, objet: 1.8, auberge: 3.8 };
  let dernier = {};
  function bruitage(id) {
    if (!ctx || ctx.state !== 'running' || !BRUITS[id] || !OPT.bruitages) return;
    const t = performance.now(); if (dernier[id] && t - dernier[id] < 45) return;   // pas deux fois le même au même instant
    dernier[id] = t;
    try { BRUITS[id](); } catch (e) { console.warn('Bruitage', id, e); }
  }
  // les sons de musique s'effacent un instant pour laisser passer un jingle
  function jingle(id) {
    bruitage(id);
    if (!ctx) return;
    const t = ctx.currentTime; gMus.gain.cancelScheduledValues(t); gMus.gain.setValueAtTime(gMus.gain.value, t);
    gMus.gain.linearRampToValueAtTime(niveau(OPT.musique) * .25, t + .1); gMus.gain.setTargetAtTime(niveau(OPT.musique) * .9, t + (DUREE_JINGLE[id] || 1.8), .4);
  }

  // un appui sur un bouton fait un petit bruit (le bouton doré un peu plus marqué)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (b) bruitage(b.disabled ? 'erreur' : b.classList.contains('main') ? 'valider' : 'clic');
  }, true);

  return { musique, ambiance, panorama, combat, bruitage, jingle, volumes, demarrer };
})();
