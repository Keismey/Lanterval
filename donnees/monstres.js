/* Lanterval · Monstres et boss.
   Les noms sont dans textes/<langue>/noms.txt (monstre.<id>, .court, .desc, .special).
   garde : coups sur une faiblesse pour la briser ; faible / resiste : éléments (L Lame, T Terre, F Feu, E Eau) ;
   taille : hauteur à l'écran, en part de la scène ; f : nom féminin (« vaincue »).
   capacites :
     spores  : touche toute l'équipe (chance, mult)
     regen   : se soigne sous un seuil de PV (seuil, chance, v)
     fort    : coup puissant avec un nom (chance, mult)
     charge  : prépare un coup sur toute l'équipe tous les 3 tours (mult), annulé si la garde est brisée */

const MONSTRES = {
  loup: { pv: 34, atk: 10, def: 3, vit: 12, garde: 2, faible: ['L', 'F'], resiste: [], xp: 8, or: 6, taille: .17 },
  spore: { pv: 28, atk: 8, def: 2, vit: 7, garde: 2, faible: ['F', 'L'], resiste: ['E'], xp: 7, or: 5, taille: .15,
    capacites: [{ type: 'spores', chance: .35, mult: .75 }] },
  chauve: { pv: 24, atk: 9, def: 2, vit: 15, garde: 1, faible: ['T'], resiste: [], xp: 7, or: 6, taille: .13 },
  gelee: { pv: 40, atk: 9, def: 6, vit: 6, garde: 3, faible: ['T', 'E'], resiste: ['F', 'L'], xp: 10, or: 8, taille: .15, f: true,
    capacites: [{ type: 'regen', seuil: .5, chance: .4, v: 12 }] },
  ombre: { pv: 46, atk: 12, def: 4, vit: 11, garde: 3, faible: ['F', 'E'], resiste: ['T'], xp: 14, or: 10, taille: .2, f: true,
    capacites: [{ type: 'fort', chance: .3, mult: 1.35 }] },
  alpha: { pv: 85, atk: 13, def: 5, vit: 13, garde: 4, faible: ['F', 'L'], resiste: ['T'], xp: 30, or: 25, taille: .21,
    capacites: [{ type: 'fort', chance: .3, mult: 1.35 }] },
  golem: { pv: 260, atk: 17, def: 7, vit: 7, garde: 4, faible: ['T', 'E'], resiste: ['F', 'L'], xp: 60, or: 50, taille: .38, boss: true,
    capacites: [{ type: 'charge', mult: 1.55 }] }
};
