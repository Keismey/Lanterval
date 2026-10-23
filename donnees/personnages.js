/* Lanterval · personnages importants de l'histoire (onglet Personnages du Codex).

   Chaque personnage a ses infos dans l'ordre de l'histoire : une condition par info (voir cond() dans moteur/etat.js,
   true = dès le début). L'info n apparaît quand sa condition devient vraie, avec le texte perso.<id>.<n>
   (textes/fr/personnages.txt) ; la première fait apparaître le personnage. Le nom vient de parle.<id>,
   le visage de heros.<id> ou pnj.<id> dans donnees/images.js.
   Une info nouvelle met une pastille sur l'icône du Codex, l'onglet et le personnage, jusqu'à ce qu'on déplie sa fiche. */
const PERSONNAGES = {
  kael: [true, 'fini a1.e7', 'fini a1.e9', 'fini a1.e10', 'fini a2.e8', 'fini a3.e9', 'fini a3.e10', 'annexe aldric 4', 'fini a4.e7'],
  mira: ['fini a1.e2', 'fini a1.e3', 'fini a2.e8', 'fini a3.e4', 'fini a3.e10', 'annexe moule 4', 'fini a4.e7'],
  sol: ['fini a1.e4', 'fini a2.e2', 'fini a2.e4', 'fini a2.e8', 'annexe berceuse 4', 'fini a4.e7'],
  orvan: [true, 'fini a1.e3', 'fini a1.e7', 'fini a2.e8', 'fini a4.e7', 'annexe larmes 3'],
  brann: [true, 'fini a1.e9', 'fini a1.e10', 'fini a2.e8', 'annexe aldric 2'],
  hilde: [true, 'fini a1.e3', 'fini a2.e8', 'fini a3.e2', 'fini a3.e4', 'fini a3.e10', 'annexe moule 2'],
  silhouette: ['fini a1.e2', 'fini a1.e6'],
  varen: ['fini a1.e9', 'fini a2.e7', 'fini a3.e1', 'fini a3.e8', 'fini a4.e6', 'annexe cerfvolant 5'],
  sansnom: ['fini a1.e9', 'fini a3.e9', 'annexe aldric 4'],
  maelle: ['fini a2.e2', 'fini a2.e5'],
  naia: ['fini a2.e5', 'fini a2.e8', 'annexe berceuse 2', 'annexe berceuse 4', 'fini a4.e1'],
  erwan: ['fini a2.e7'],
  nev: ['fini a2.e6', 'fini a3.e1', 'fini a3.e8', 'fini a3.e10', 'fini a4.e2', 'fini a4.e6', 'annexe cerfvolant 5'],
  heraut: ['fini a2.e7'],
  ysold: ['fini a2.e8', 'fini a4.e4', 'fini a4.e6'],
  // quêtes annexes de la vallée
  roxane: ['annexe chasse 1', 'annexe chasse 3', 'annexe chasse 7', 'annexe chasse 9'],
  fennel: ['annexe colporteur 1', 'annexe colporteur 5', 'annexe colporteur 7', 'annexe colporteur 8'],
  // acte 3 et quêtes annexes de Cendre
  dorn: ['fini a3.e2', 'annexe pierre 4'],
  tobi: ['fini a3.e6', 'annexe mineurs 4'],
  // acte 4 et quêtes annexes des Hauts-Vents
  tavor: ['fini a4.e2', 'fini a4.e4', 'fini a4.e7', 'annexe larmes 1'],
  pell: ['fini a4.e1', 'annexe courrier 6'],
  ilse: ['fini a4.e2', 'annexe colporteur 8', 'annexe wyverne 4'],
  liss: ['fini a4.e2', 'annexe cerfvolant 2', 'annexe cerfvolant 5']
};
