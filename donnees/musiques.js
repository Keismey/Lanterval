/* Lanterval · les musiques (fichiers dans son/, préparés par outils/musiques.js à partir des sources Gemini).
   fichier : null tant que la piste n'existe pas ; on joue alors celle de `sinon` (et ainsi de suite).
   Chaque piste boucle : vers la fin, elle repart du début en fondu enchaîné (FONDU_BOUCLE secondes). */
const FONDU_BOUCLE = 3;
const MUSIQUES = {
  theme:      { fichier: 'son/theme.m4a' },                // écran d'accueil, écran titre
  lanterval:  { fichier: 'son/lanterval.m4a', sinon: 'theme' },           // village de Lanterval
  brume:      { fichier: null, sinon: 'lanterval' },       // Lanterval tant que la lanterne n'est pas rallumée
  salvent:    { fichier: null, sinon: 'lanterval' },
  forgecendre:{ fichier: null, sinon: 'lanterval' },
  aerie:      { fichier: null, sinon: 'lanterval' },
  voyage:     { fichier: null, sinon: 'theme' },           // cartes du monde
  vallee:     { fichier: null, sinon: 'voyage' },          // zones, par région
  cote:       { fichier: null, sinon: 'voyage' },
  cendre:     { fichier: null, sinon: 'voyage' },
  vents:      { fichier: null, sinon: 'voyage' },
  escalier:   { fichier: null, sinon: 'vents' },
  combat:     { fichier: 'son/combat.m4a' },
  boss:       { fichier: null, sinon: 'combat' },
  final:      { fichier: null, sinon: 'boss' },            // Ysold et la Paupière du monde
  emotion:    { fichier: null, sinon: null },              // scènes (plus tard)
  menace:     { fichier: null, sinon: null },
  epilogue:   { fichier: null, sinon: 'theme' }            // écran de fin
};
const MUSIQUE_FINAL = ['ysold', 'paupiere'];   // le dernier combat a sa propre musique
