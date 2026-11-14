/* Lanterval · rapport d'équilibrage : fait jouer le bot (outils/bot.js) sur plusieurs graines et deux profils,
   puis assemble un rapport Markdown chiffré (niveaux, PV aux boss, reprises, or, objets, classes) avec les seuils visés.
   Usage : node outils/equilibrage.js [graines=3] [sortie=equilibrage.md] [--parallele=3] [--profil=applique|presse]
   Une partie complète prend 10 à 20 minutes ; les parties tournent en parallèle. */
'use strict';
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--')), OPT = process.argv.slice(2).filter(a => a.startsWith('--'));
const N = +(ARGS[0] || 3), SORTIE = ARGS[1] || 'equilibrage.md';
const PAR = +((OPT.find(a => a.startsWith('--parallele=')) || '').slice(12) || 3);
const SEUL = (OPT.find(a => a.startsWith('--profil=')) || '').slice(9);
const PROFILS = SEUL ? [SEUL] : ['applique', 'presse'];
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lanterval-bot-'));

// seuils visés (plan de rééquilibrage 0.9.0)
const SEUILS = {
  applique: { defaites: [0, 3], pvmin: [25, 45], achat: [60, 85], objets: [2, 6], col: [7, 9], fin: [30, 36] },
  presse: { defaites: [2, 12], pvmin: [5, 35], achat: [30, 60], objets: [3, 10], col: [5, 7], fin: [27, 33] }
};
// boss de la quête principale (pour les PV les plus bas et les objets)
const PRINCIPAUX = ['golem', 'varen', 'vouivre', 'mere', 'heraut', 'forgeur', 'varen2', 'sansnom2', 'serpent', 'varen3', 'sansnom3', 'ysold', 'paupiere'];

function jouer(graine, profil) {
  return new Promise(res => {
    const f = path.join(TMP, `${profil}-${graine}.json`), t0 = Date.now();
    const p = spawn(process.execPath, [path.join(__dirname, 'bot.js'), String(graine), ...(profil === 'presse' ? ['--presse'] : []), '--json=' + f], { stdio: ['ignore', 'pipe', 'pipe'] });
    let sortie = ''; p.stdout.on('data', d => { sortie += d; }); p.stderr.on('data', d => { sortie += d; });
    p.on('close', () => {
      let r = null; try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { r = { graine, profil, echec: sortie.slice(-2000), combats: [] }; }
      r.duree = Math.round((Date.now() - t0) / 60000); console.log(`  fini : ${profil} graine ${graine} (${r.duree} min)`); res(r);
    });
  });
}
const med = a => { const b = a.filter(x => x !== undefined && !isNaN(x)).sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : NaN; };
const moy = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const ok = (v, [a, b]) => isNaN(v) ? '?' : v < a ? '⬇' : v > b ? '⬆' : '✓';
const pc = x => isNaN(x) ? '–' : Math.round(x) + ' %';

(async () => {
  const taches = []; for (const p of PROFILS) for (let g = 1; g <= N; g++) taches.push([g, p]);
  console.log(`${taches.length} parties, ${PAR} à la fois…`);
  const res = []; let i = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { while (i < taches.length) { const [g, p] = taches[i++]; res.push(await jouer(g, p)); } }));
  const L = [`# Lanterval · rapport d'équilibrage`, '', `${N} graine(s) par profil · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`, ''];
  for (const prof of PROFILS) {
    const R = res.filter(r => r.profil === prof).sort((a, b) => a.graine - b.graine), S = SEUILS[prof];
    L.push(`## Profil ${prof === 'applique' ? 'appliqué' : 'pressé'}`, '');
    for (const r of R) if (r.echec || (r.erreurs && r.erreurs.length)) L.push(`- ⚠ graine ${r.graine} : ${r.echec ? 'partie interrompue' : r.erreurs.length + ' erreur(s) de la page : ' + r.erreurs.slice(0, 3).join(' | ')}`);
    const finies = R.filter(r => r.etat);
    // boss : une ligne par boss rencontré
    const boss = {};
    for (const r of finies) for (const c of r.combats.filter(c => c.boss)) {
      const id = c.ids.split(' ').find(x => PRINCIPAUX.includes(x)) || c.ids.split(' ').sort((a, b) => b.length - a.length)[0];
      const k = c.etape + ' ' + c.ids; (boss[k] = boss[k] || { k, id, etape: c.etape, l: [] }).l.push(c);
    }
    L.push('| Étape | Combat | Niveau | Classes (graine 1) | PV min | Tours | Objets | Reprises | Perdus |', '|---|---|---|---|---|---|---|---|---|');
    for (const b of Object.values(boss)) {
      const l = b.l, niv = med(l.map(c => +c.niv.split('/')[0]));
      L.push(`| ${b.etape} | ${l[0].ids}${PRINCIPAUX.includes(b.id) ? ' ★' : ''} | ${niv} | ${l[0].classes} | ${pc(med(l.map(c => c.min * 100)))} | ${med(l.map(c => c.tours))} | ${moy(l.map(c => c.objets)).toFixed(1)} | ${l.reduce((a, c) => a + c.reprises, 0)} | ${l.filter(c => c.res === 'defaite').length} |`);
    }
    L.push('', '★ boss de la quête principale.', '');
    // synthèse et seuils
    const princ = finies.flatMap(r => r.combats.filter(c => c.boss && c.ids.split(' ').some(x => PRINCIPAUX.includes(x)) && !/sansnom$/.test(c.ids)));
    const tard = princ.filter(c => !/^a1/.test(c.etape));
    const defaites = med(finies.map(r => r.etat.reprises + r.etat.defaites));
    const pvmin = med(princ.map(c => c.min * 100));
    const achat = med(princ.map(c => c.equipe * 100));
    const objets = moy(tard.map(c => c.objets));
    const col = med(finies.map(r => { const c = r.combats.find(c => c.etape === 'a1.e9'); return c ? +c.niv.split('/')[0] : NaN; }));
    const fin = med(finies.map(r => { const c = r.combats.find(c => c.ids === 'paupiere'); return c ? +c.niv.split('/')[0] : NaN; }));
    const classes = med(finies.map(r => Object.keys(r.classes).length + 3));
    L.push('| Critère | Mesure (médiane) | Visé | |', '|---|---|---|---|');
    L.push(`| Défaites et reprises sur la partie | ${defaites} | ${S.defaites.join(' à ')} | ${ok(defaites, S.defaites)} |`);
    L.push(`| PV min aux boss principaux | ${pc(pvmin)} | ${S.pvmin.join(' à ')} % | ${ok(pvmin, S.pvmin)} |`);
    L.push(`| Équipement à jour aux boss principaux | ${pc(achat)} | ${S.achat.join(' à ')} % | ${ok(achat, S.achat)} |`);
    L.push(`| Objets par boss principal (actes 2 à 4) | ${objets.toFixed(1)} | ${S.objets.join(' à ')} | ${ok(objets, S.objets)} |`);
    L.push(`| Niveau au col (Varen, a1.e9) | ${col} | ${S.col.join(' à ')} | ${ok(col, S.col)} |`);
    L.push(`| Niveau au dernier boss | ${fin} | ${S.fin.join(' à ')} | ${ok(fin, S.fin)} |`);
    if (prof === 'applique') L.push(`| Classes différentes jouées | ${classes} | 6 ou plus | ${classes >= 6 ? '✓' : '⬇'} |`);
    L.push('');
    const somme = k => { const o = {}; for (const r of finies) for (const [a, v] of Object.entries(r[k] || {})) o[a] = (o[a] || 0) + v / finies.length; return o; };
    const og = somme('orGagne'), oe = somme('achatsEq'), oo = somme('achatsObj');
    L.push('| Or (moyenne) | a1 | a2 | a3 | a4 |', '|---|---|---|---|---|');
    L.push(`| Gagné | ${['a1', 'a2', 'a3', 'a4'].map(a => Math.round(og[a] || 0)).join(' | ')} |`);
    L.push(`| Équipement | ${['a1', 'a2', 'a3', 'a4'].map(a => Math.round(oe[a] || 0)).join(' | ')} |`);
    L.push(`| Objets et auberge | ${['a1', 'a2', 'a3', 'a4'].map(a => Math.round(oo[a] || 0)).join(' | ')} |`, '');
    const ob = somme('objets'), cl = somme('classes');
    L.push(`Objets utilisés (moyenne par partie) : ${Object.entries(ob).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || 'aucun'}.`, '');
    if (prof === 'applique') L.push(`Changements de classe (moyenne) : ${Object.entries(cl).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}.`, '');
    L.push(`Combats d'entraînement après une défaite : ${finies.map(r => r.entrainement).join(', ')} · niveaux finaux : ${finies.map(r => r.etat.niv.map(x => x.split(' ')[1]).join('/')).join(' ; ')}.`, '');
  }
  fs.writeFileSync(SORTIE, L.join('\n') + '\n');
  console.log(`Rapport : ${SORTIE}`);
})();
