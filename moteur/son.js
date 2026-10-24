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
    // petites fanfares en attendant les jingles de Gemini
    victoire: () => { arpege([523, 523, 523], .1, .12, 'square', .06); [392, 523, 659].forEach(f => note(f, .25, 'square', .05, .32)); [440, 587, 698].forEach(f => note(f, .25, 'square', .05, .5)); [523, 659, 784, 1047].forEach(f => note(f, .9, 'triangle', .1, .7)); },
    defaite: () => arpege([440, 415, 392, 330], .22, .5, 'triangle', .13)
  };
  let dernier = {};
  function bruitage(id) {
    if (!ctx || ctx.state !== 'running' || !BRUITS[id] || !OPT.bruitages) return;
    const t = performance.now(); if (dernier[id] && t - dernier[id] < 45) return;   // pas deux fois le même au même instant
    dernier[id] = t;
    try { BRUITS[id](); } catch (e) {}
  }
  // les sons de musique s'effacent un instant pour laisser passer un jingle
  function jingle(id) {
    bruitage(id);
    if (!ctx) return;
    const t = ctx.currentTime; gMus.gain.cancelScheduledValues(t); gMus.gain.setValueAtTime(gMus.gain.value, t);
    gMus.gain.linearRampToValueAtTime(niveau(OPT.musique) * .25, t + .1); gMus.gain.setTargetAtTime(niveau(OPT.musique) * .9, t + 1.8, .4);
  }

  // un appui sur un bouton fait un petit bruit (le bouton doré un peu plus marqué)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (b) bruitage(b.disabled ? 'erreur' : b.classList.contains('main') ? 'valider' : 'clic');
  }, true);

  return { musique, ambiance, combat, bruitage, jingle, volumes, demarrer };
})();
