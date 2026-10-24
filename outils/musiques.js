/* Lanterval · préparation des musiques (sources Gemini en MP3 → son/*.m4a).
   Usage : node outils/musiques.js <dossier des sources> [piste…]
   Chaque source s'appelle NN-<piste>.mp3 (ex. 01-theme.mp3). Pour chacune :
   silence du début et de la fin retiré, volume ramené à −18 LUFS (toutes les pistes au même niveau),
   AAC 96 kb/s. Affiche la durée finale, à reporter dans `fin` (donnees/musiques.js) si besoin. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [src, ...seules] = process.argv.slice(2);
if (!src) { console.log('Usage : node outils/musiques.js <dossier des sources> [piste…]'); process.exit(1); }
const SORTIE = path.join(__dirname, '..', 'son');
function lancer(args) { const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' }); return r.stderr; }

for (const f of fs.readdirSync(src).filter(f => /^\d\d-[a-z0-9-]+\.mp3$/.test(f)).sort()) {
  const piste = f.replace(/^\d\d-/, '').replace(/\.mp3$/, '');
  if (seules.length && !seules.includes(piste)) continue;
  const entree = path.join(src, f);
  const coupe = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse';
  const mesure = lancer(['-i', entree, '-af', coupe + ',ebur128=framelog=quiet', '-f', 'null', '-']);
  const lufs = +/I:\s+(-?[\d.]+) LUFS/.exec(mesure.split('Summary:').pop())[1];
  const gain = (-18 - lufs).toFixed(2);
  const sortie = path.join(SORTIE, piste + '.m4a');
  lancer(['-y', '-i', entree, '-af', `${coupe},volume=${gain}dB,alimiter=limit=0.95`, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', sortie]);
  const duree = +/Duration: (\d+):(\d+):([\d.]+)/.exec(lancer(['-i', sortie])).slice(1).reduce((a, x) => a * 60 + +x, 0);
  console.log(`${piste} : ${lufs} LUFS → gain ${gain} dB, ${duree.toFixed(1)} s, ${(fs.statSync(sortie).size / 1024).toFixed(0)} Ko`);
}
