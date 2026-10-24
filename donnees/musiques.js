/* Lanterval · les musiques (fichiers dans son/, préparés par outils/musiques.js à partir des sources Gemini).
   fichier : null tant que la piste n'existe pas ; on joue alors celle de `sinon` (et ainsi de suite).
   Chaque piste boucle : vers la fin, elle repart du début en fondu enchaîné (FONDU_BOUCLE secondes). */
const FONDU_BOUCLE = 3;
const MUSIQUES = {
  theme:      { fichier: 'son/theme.m4a' },                // écran d'accueil, écran titre
  lanterval:  { fichier: 'son/lanterval.m4a', sinon: 'theme' },           // village de Lanterval
  brume:      { fichier: 'son/brume.m4a', sinon: 'lanterval' },       // Lanterval tant que la lanterne n'est pas rallumée
  salvent:    { fichier: 'son/salvent.m4a', sinon: 'lanterval' },
  forgecendre:{ fichier: 'son/forgecendre.m4a', sinon: 'lanterval' },
  aerie:      { fichier: 'son/aerie.m4a', sinon: 'lanterval' },
  voyage:     { fichier: 'son/voyage.m4a', sinon: 'theme' },           // cartes du monde
  vallee:     { fichier: 'son/vallee.m4a', sinon: 'voyage' },          // zones, par région
  cote:       { fichier: 'son/cote.m4a', sinon: 'voyage' },
  cendre:     { fichier: 'son/cendre.m4a', sinon: 'voyage' },
  vents:      { fichier: 'son/vents.m4a', sinon: 'voyage' },
  escalier:   { fichier: 'son/escalier.m4a', sinon: 'vents' },
  combat:     { fichier: 'son/combat.m4a' },
  boss:       { fichier: 'son/boss.m4a', sinon: 'combat' },
  final:      { fichier: 'son/final.m4a', sinon: 'boss' },            // Ysold et la Paupière du monde
  emotion:    { fichier: 'son/emotion.m4a', sinon: null },              // scènes (plus tard)
  menace:     { fichier: 'son/menace.m4a', sinon: null },
  epilogue:   { fichier: 'son/epilogue.m4a', sinon: 'theme' }            // écran de fin
};
const MUSIQUE_FINAL = ['ysold', 'paupiere'];   // le dernier combat a sa propre musique
// panoramas de récit qui changent la musique jusqu'au retour au lieu (événement `decor`, fin de la scène ou combat)
const PANO_MUSIQUE = {
  vision: 'emotion', masque: 'emotion', berceuse: 'emotion', carnet: 'emotion', 'cage-hilde': 'emotion', feu: 'emotion',
  larmes: 'emotion', cerfvolant: 'emotion', aldric: 'emotion', fleur: 'emotion',
  insigne: 'menace', cage: 'menace', phare: 'menace', 'nev-champs': 'menace', 'ysold-azur': 'menace', ysold: 'menace', oeil: 'menace', echo: 'menace',
  'epilogue.kael': 'epilogue', 'epilogue.mira': 'epilogue', 'epilogue.sol': 'epilogue', 'epilogue.nev': 'epilogue'
};
