/* Lanterval · personnages importants de l'histoire (onglet Personnages du Codex).

   Chaque personnage a ses infos dans l'ordre de l'histoire : une condition par info (voir cond() dans moteur/etat.js,
   true = dès le début). L'info n apparaît quand sa condition devient vraie, avec le texte perso.<id>.<n>
   (textes/fr/personnages.txt) ; la première fait apparaître le personnage. Le nom vient de parle.<id>,
   le visage de heros.<id> ou pnj.<id> dans donnees/images.js.
   Une info nouvelle met une pastille sur l'icône du Codex, l'onglet et le personnage, jusqu'à ce qu'on déplie sa fiche. */
const PERSONNAGES = {
  kael: [true, 'fini a1.e7', 'fini a1.e9', 'fini a1.e10', 'fini a2.e8'],
  mira: ['fini a1.e2', 'fini a1.e3', 'fini a2.e8'],
  sol: ['fini a1.e4', 'fini a2.e2', 'fini a2.e4', 'fini a2.e8'],
  orvan: [true, 'fini a1.e3', 'fini a1.e7', 'fini a2.e8'],
  brann: [true, 'fini a1.e9', 'fini a1.e10', 'fini a2.e8'],
  hilde: [true, 'fini a1.e3', 'fini a2.e8'],
  silhouette: ['fini a1.e2', 'fini a1.e6'],
  varen: ['fini a1.e9', 'fini a2.e7'],
  sansnom: ['fini a1.e9'],
  maelle: ['fini a2.e2', 'fini a2.e5'],
  naia: ['fini a2.e5', 'fini a2.e8', 'annexe berceuse 2'],
  erwan: ['fini a2.e7'],
  nev: ['fini a2.e6'],
  heraut: ['fini a2.e7'],
  ysold: ['fini a2.e8'],
  // quêtes annexes de la vallée
  roxane: ['annexe chasse 1', 'annexe chasse 3'],
  fennel: ['annexe colporteur 1', 'annexe colporteur 5']
};
