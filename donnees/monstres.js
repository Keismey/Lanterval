/* Lanterval · Monstres et boss.
   Les noms sont dans textes/<langue>/noms.txt (monstre.<id>, .court, .desc, .special).
   garde : coups sur une faiblesse pour la briser ; faible / resiste : éléments (L Lame, T Terre, F Feu, E Eau, V Vent) ;
   taille : hauteur à l'écran, en part de la scène ; f : nom féminin (« vaincue »).
   capacites :
     spores  : touche toute l'équipe (chance, mult)
     regen   : se soigne sous un seuil de PV (seuil, chance, v)
     fort    : coup puissant avec un nom (chance, mult)
     charge  : prépare un coup sur toute l'équipe tous les 3 tours (mult), annulé si la garde est brisée
     drain   : mord et se soigne d'autant (chance)
     double  : frappe deux fois (chance) ; garde: true = seulement tant que sa garde n'est pas brisée
     appel   : appelle un renfort à la place d'un allié tombé (id, chance)
   vol : ce qu'on peut lui voler (Voleur, Corsaire) ; sans vol, on lui prend de l'or.
   endormi : résiste à la Berceuse (les boss y résistent toujours)
   intouchable : ne descend jamais sous 1 PV et sa garde ne se brise pas (combat perdu d'avance, voir acte1.js) */

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
    capacites: [{ type: 'charge', mult: 1.55 }] },
  belier: { pv: 58, atk: 14, def: 8, vit: 8, garde: 3, faible: ['E', 'F'], resiste: ['T'], xp: 14, or: 10, taille: .19,
    capacites: [{ type: 'fort', chance: .3, mult: 1.4 }] },
  harpie: { pv: 40, atk: 12, def: 3, vit: 17, garde: 2, faible: ['T', 'L'], resiste: ['E'], xp: 13, or: 9, taille: .18, f: true,
    capacites: [{ type: 'spores', chance: .3, mult: .7 }] },
  varen: { pv: 230, atk: 16, def: 6, vit: 15, garde: 4, faible: ['T', 'F'], resiste: ['E'], xp: 80, or: 60, taille: .3, boss: true,
    capacites: [{ type: 'fort', chance: .35, mult: 1.4 }] },
  sansnom: { pv: 999, atk: 70, def: 30, vit: 9, garde: 9, faible: [], resiste: ['L', 'T', 'F', 'E'], xp: 0, or: 0, taille: .42, boss: true, intouchable: true,
    capacites: [{ type: 'charge', mult: 2.5 }] },

  // ---------- Acte 2 : Côte de Salvent ----------
  crabe: { pv: 70, atk: 26, def: 12, vit: 7, garde: 4, faible: ['T', 'F'], resiste: ['E'], xp: 18, or: 12, taille: .15, vol: 'herbe' },
  sangsue: { pv: 58, atk: 24, def: 5, vit: 10, garde: 2, faible: ['F', 'L'], resiste: ['E'], xp: 16, or: 11, taille: .14, f: true, vol: 'tonique',
    capacites: [{ type: 'drain', chance: .4 }] },
  follet: { pv: 50, atk: 27, def: 4, vit: 18, garde: 2, faible: ['E', 'T'], resiste: ['F'], xp: 18, or: 12, taille: .14, vol: 'tonique',
    capacites: [{ type: 'spores', chance: .3, mult: .7 }] },
  crapaud: { pv: 78, atk: 26, def: 7, vit: 8, garde: 3, faible: ['L', 'F'], resiste: ['E'], xp: 19, or: 13, taille: .16, vol: 'herbe',
    capacites: [{ type: 'spores', chance: .35, mult: .75 }] },
  noye: { pv: 84, atk: 32, def: 8, vit: 9, garde: 3, faible: ['F', 'L'], resiste: ['E'], xp: 22, or: 15, taille: .21, vol: 'elixir',
    capacites: [{ type: 'fort', chance: .3, mult: 1.4 }] },
  poisson: { pv: 52, atk: 30, def: 5, vit: 20, garde: 2, faible: ['T'], resiste: ['E', 'F'], xp: 20, or: 13, taille: .14, vol: 'herbe',
    capacites: [{ type: 'double', chance: .35 }] },
  soldat: { pv: 92, atk: 35, def: 10, vit: 11, garde: 4, faible: ['F', 'E'], resiste: ['T'], xp: 24, or: 18, taille: .21, vol: 'tonique',
    capacites: [{ type: 'fort', chance: .3, mult: 1.35 }] },
  vouivre: { pv: 620, atk: 33, def: 9, vit: 12, garde: 5, faible: ['T'], resiste: ['E', 'F'], xp: 140, or: 100, taille: .36, boss: true, f: true, vol: 'elixir',
    capacites: [{ type: 'charge', mult: 1.5 }, { type: 'drain', chance: .25 }] },
  mere: { pv: 900, atk: 40, def: 14, vit: 7, garde: 6, faible: ['T', 'F'], resiste: ['E', 'L'], xp: 170, or: 120, taille: .4, boss: true, f: true, vol: 'perle',
    capacites: [{ type: 'appel', id: 'crabe', chance: .35 }, { type: 'fort', chance: .3, mult: 1.45 }] },
  heraut: { pv: 1150, atk: 48, def: 12, vit: 20, garde: 5, faible: ['E', 'T'], resiste: ['F'], xp: 220, or: 160, taille: .3, boss: true, vol: 'cloche',
    capacites: [{ type: 'charge', mult: 1.6 }, { type: 'fort', chance: .3, mult: 1.4 }] },
  // boss des quêtes annexes de la côte
  pie: { pv: 300, atk: 30, def: 6, vit: 19, garde: 4, faible: ['T', 'L'], resiste: ['E'], xp: 70, or: 60, taille: .2, f: true, vol: 'rose',
    capacites: [{ type: 'double', chance: .3 }] },
  bosco: { pv: 480, atk: 40, def: 10, vit: 12, garde: 5, faible: ['F', 'T'], resiste: ['E'], xp: 110, or: 90, taille: .26, vol: 'elixir',
    capacites: [{ type: 'fort', chance: .35, mult: 1.45 }] },
  // bêtes du « Carnet du chasseur » (Roxane)
  sanglier: { pv: 520, atk: 27, def: 12, vit: 9, garde: 7, faible: ['F'], resiste: ['T'], xp: 90, or: 50, taille: .24, vol: 'tonique',
    capacites: [{ type: 'fort', chance: .35, mult: 1.45 }] },
  anguille: { pv: 600, atk: 32, def: 8, vit: 17, garde: 5, faible: ['T'], resiste: ['E', 'F'], xp: 130, or: 80, taille: .26, f: true, vol: 'elixir',
    capacites: [{ type: 'double', chance: .6, garde: true }] },

  // ---------- Acte 3 : Plaines de Cendre ----------
  chien: { pv: 120, atk: 54, def: 8, vit: 22, garde: 2, faible: ['E', 'V'], resiste: ['F'], xp: 24, or: 18, taille: .17, vol: 'herbe',
    capacites: [{ type: 'double', chance: .3 }] },
  scarabee: { pv: 160, atk: 52, def: 16, vit: 9, garde: 5, faible: ['E', 'T'], resiste: ['F', 'L'], xp: 27, or: 22, taille: .16, vol: 'tonique',
    capacites: [{ type: 'fort', chance: .3, mult: 1.4 }] },
  salamandre: { pv: 105, atk: 55, def: 7, vit: 16, garde: 2, faible: ['E'], resiste: ['F'], xp: 22, or: 16, taille: .14, f: true, vol: 'tonique',
    capacites: [{ type: 'spores', chance: .3, mult: .7 }] },
  ver: { pv: 170, atk: 58, def: 10, vit: 10, garde: 3, faible: ['V', 'E'], resiste: ['T', 'L'], xp: 29, or: 22, taille: .2, vol: 'herbe',
    capacites: [{ type: 'drain', chance: .35 }] },
  automate: { pv: 195, atk: 60, def: 18, vit: 8, garde: 5, faible: ['E', 'F'], resiste: ['L', 'T'], xp: 32, or: 28, taille: .21, vol: 'elixir',
    capacites: [{ type: 'charge', mult: 1.25 }] },
  sentinelle: { pv: 170, atk: 58, def: 14, vit: 13, garde: 4, faible: ['V', 'E'], resiste: ['T'], xp: 30, or: 26, taille: .21, f: true, vol: 'tonique',
    capacites: [{ type: 'fort', chance: .3, mult: 1.35 }] },
  lezard: { pv: 190, atk: 63, def: 12, vit: 14, garde: 3, faible: ['E', 'V'], resiste: ['F'], xp: 35, or: 26, taille: .19, vol: 'herbe',
    capacites: [{ type: 'fort', chance: .3, mult: 1.4 }] },
  esprit: { pv: 145, atk: 64, def: 6, vit: 20, garde: 3, faible: ['E'], resiste: ['F', 'L'], xp: 34, or: 24, taille: .16, vol: 'ether',
    capacites: [{ type: 'spores', chance: .35, mult: .7 }] },
  // boss de l'acte 3
  forgeur: { pv: 3200, atk: 80, def: 18, vit: 24, garde: 13, faible: ['E', 'V'], resiste: ['F', 'L'], xp: 260, or: 220, taille: .4, boss: true, vol: 'potion',
    capacites: [{ type: 'charge', mult: 1.5 }, { type: 'appel', id: 'automate', chance: .3 }] },
  varen2: { pv: 2000, atk: 80, def: 12, vit: 30, garde: 7, faible: ['T', 'L'], resiste: ['V'], xp: 240, or: 0, taille: .3, boss: true, vol: 'ether',
    capacites: [{ type: 'fort', chance: .35, mult: 1.45 }, { type: 'double', chance: .25 }] },
  sansnom2: { pv: 5200, atk: 94, def: 20, vit: 22, garde: 14, faible: ['F', 'V'], resiste: ['T', 'E'], xp: 360, or: 0, taille: .42, boss: true, vol: 'potion',
    capacites: [{ type: 'charge', mult: 1.7 }, { type: 'fort', chance: .3, mult: 1.4 }, { type: 'double', chance: .25, garde: true }] },
  // quêtes annexes de Cendre
  salreine: { pv: 1500, atk: 64, def: 10, vit: 15, garde: 6, faible: ['E'], resiste: ['F', 'T'], xp: 210, or: 120, taille: .3, f: true, vol: 'potion',
    capacites: [{ type: 'appel', id: 'salamandre', chance: .4 }, { type: 'spores', chance: .3, mult: .75 }] },
  statue: { pv: 150, atk: 55, def: 16, vit: 7, garde: 5, faible: ['V', 'E'], resiste: ['T', 'L'], xp: 27, or: 20, taille: .22, vol: 'tonique',
    capacites: [{ type: 'fort', chance: .3, mult: 1.4 }] },
  tellure: { pv: 3000, atk: 84, def: 16, vit: 24, garde: 14, faible: ['V'], resiste: ['T', 'L'], xp: 240, or: 150, taille: .38, boss: true, vol: 'ether',
    capacites: [{ type: 'charge', mult: 1.5 }, { type: 'regen', seuil: .5, chance: .3, v: 60 }] }
};
