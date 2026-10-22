/* Lanterval · Objets de soin, équipement et objets importants.
   Les noms sont dans textes/<langue>/noms.txt (objet.<id>, equip.<id>, important.<id>).
   v : prix de revente ; prix : prix en boutique ; cadeau : ne se vend pas. */

const OBJETS = {
  herbe: { hp: 35, v: 4 },
  tonique: { pp: 12, v: 6 },
  elixir: { hp: 90, v: 12 }
};

const EQUIPEMENT = {
  // place : arme, armure ou acc (accessoire) ; type : famille d'arme ; st : bonus ; classes : qui peut porter cette armure
  // el : arme élémentaire (L, T, F, E) : l'Attaque prend cet élément au lieu de Lame
  dague: { place: 'arme', type: 'dague', v: 6, st: { atk: 3 } },
  baton: { place: 'arme', type: 'baton', v: 6, st: { atk: 1, mag: 3 } },
  epee: { place: 'arme', type: 'epee', prix: 60, st: { atk: 7 } },
  braise: { place: 'arme', type: 'baton', prix: 65, st: { atk: 2, mag: 7 } },
  acier: { place: 'arme', type: 'epee', prix: 130, st: { atk: 11 } },
  chene: { place: 'arme', type: 'baton', prix: 125, st: { atk: 3, mag: 10 } },
  arc: { place: 'arme', type: 'arc', cadeau: true, st: { atk: 9, spd: 1 } },
  tunique: { place: 'armure', v: 5, st: { def: 2 } },
  cuir: { place: 'armure', v: 20, st: { def: 4, hp: 5 } },
  mailles: { place: 'armure', prix: 55, st: { def: 7, spd: -1 }, classes: ['guerrier', 'chevalier'] },
  robe: { place: 'armure', prix: 45, st: { def: 3, mag: 3, pp: 5 }, classes: ['apprenti', 'mage', 'soigneur'] },
  brigandine: { place: 'armure', prix: 120, st: { def: 10, hp: 10, spd: -1 }, classes: ['guerrier', 'chevalier'] },
  cape: { place: 'armure', prix: 100, st: { def: 5, mag: 4, pp: 8 }, classes: ['apprenti', 'mage', 'soigneur'] },
  plume: { place: 'acc', v: 25, st: { spd: 2 } },
  anneau: { place: 'acc', v: 30, st: { mag: 3 } },
  eclat: { place: 'acc', v: 40, st: { atk: 4 } },
  talisman: { place: 'acc', v: 35, st: { def: 3, hp: 8 } },
  corne: { place: 'acc', v: 50, st: { atk: 3, def: 2 } },
  medaillon: { place: 'acc', cadeau: true, st: { hp: 10 } }
};

// Objets importants (onglet « Importants » de l'inventaire), dans l'ordre d'affichage.
// mystere : affiché « ??? » tant que la quête qui le demande n'est pas ouverte (aucun dans l'acte 1 pour l'instant).
const IMPORTANTS = {
  'eclat-lanterne': {},
  insigne: {},
  coeur: {},
  croc: {},
  'epee-pere': {}   // l'épée d'Aldric, le père de Kael : reforgée à l'acte 3, rendue à son père à l'acte 4
};
