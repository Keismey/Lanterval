/* Lanterval · Objets de soin, équipement et objets importants.
   Les noms sont dans textes/<langue>/noms.txt (objet.<id>, equip.<id>, important.<id>).
   v : prix de revente ; prix : prix en boutique ; cadeau : ne se vend pas. */

const OBJETS = {
  herbe: { hp: 35, v: 4 },
  tonique: { pp: 12, v: 6 },
  elixir: { hp: 90, v: 12 },
  // acte 3 (Forgecendre)
  potion: { hp: 180, v: 25 },
  ether: { pp: 30, v: 15 }
};

// les classes qui portent robes et manteaux
const MAGES = ['apprenti', 'mage', 'soigneur', 'barde', 'alchimiste', 'invocateur', 'geomancien'];

const EQUIPEMENT = {
  // place : arme, armure ou acc (accessoire) ; type : famille d'arme ; st : bonus ; classes : qui peut porter cette armure
  // el : arme élémentaire (L, T, F, E, V) : l'Attaque prend cet élément au lieu de Lame
  dague: { place: 'arme', type: 'dague', v: 6, st: { atk: 3 } },
  baton: { place: 'arme', type: 'baton', v: 6, st: { atk: 1, mag: 3 } },
  epee: { place: 'arme', type: 'epee', prix: 60, st: { atk: 7 } },
  braise: { place: 'arme', type: 'baton', prix: 65, st: { atk: 2, mag: 7 } },
  acier: { place: 'arme', type: 'epee', prix: 130, st: { atk: 11 } },
  chene: { place: 'arme', type: 'baton', prix: 125, st: { atk: 3, mag: 10 } },
  arc: { place: 'arme', type: 'arc', cadeau: true, st: { atk: 9, spd: 1 } },
  // acte 2 (Salvent)
  bandes: { place: 'arme', type: 'poing', prix: 90, st: { atk: 8, spd: 1 } },
  griffes: { place: 'arme', type: 'poing', prix: 210, st: { atk: 14, spd: 2 } },
  coutelas: { place: 'arme', type: 'dague', prix: 140, st: { atk: 9, spd: 2 } },
  harpe: { place: 'arme', type: 'harpe', prix: 120, st: { atk: 2, mag: 8, pp: 6 } },
  corail: { place: 'arme', type: 'epee', prix: 240, st: { atk: 15 } },
  flots: { place: 'arme', type: 'baton', prix: 230, st: { atk: 4, mag: 14 } },
  sabre: { place: 'arme', type: 'sabre', cadeau: true, st: { atk: 16, spd: 2 } },
  // acte 3 (forge de Hilde à Forgecendre ; ardente et cratere après « Les mineurs disparus »)
  hache: { place: 'arme', type: 'hache', prix: 300, st: { atk: 22, spd: -1 } },
  cendre: { place: 'arme', type: 'epee', prix: 380, st: { atk: 21 } },
  magma: { place: 'arme', type: 'baton', prix: 360, st: { atk: 5, mag: 19 } },
  gantelets: { place: 'arme', type: 'poing', prix: 340, st: { atk: 19, spd: 2 } },
  stylet: { place: 'arme', type: 'dague', prix: 320, st: { atk: 15, spd: 3 } },
  lyre: { place: 'arme', type: 'harpe', prix: 330, st: { atk: 3, mag: 15, pp: 10 } },
  ardente: { place: 'arme', type: 'epee', prix: 600, st: { atk: 27 } },
  cratere: { place: 'arme', type: 'baton', prix: 580, st: { atk: 6, mag: 24 } },
  fendoir: { place: 'arme', type: 'hache', prix: 620, st: { atk: 29, spd: -1 } },
  // armes des quêtes annexes : Bâton des marées (Sol, « La berceuse »), Bâton de Dorn (Géomancien)
  marees: { place: 'arme', type: 'baton', cadeau: true, st: { atk: 6, mag: 27, pp: 12 } },
  dorn: { place: 'arme', type: 'baton', cadeau: true, st: { atk: 5, mag: 21, def: 3 } },
  // Cœur de forge (Mira, « Le premier moule »)
  coeurforge: { place: 'arme', type: 'baton', cadeau: true, st: { atk: 7, mag: 29, pp: 10 } },
  // marteau et tablier de Hilde (invitée, jamais dans le sac)
  marteau: { place: 'arme', type: 'marteau', cadeau: true, st: { atk: 24 } },
  tablier: { place: 'armure', cadeau: true, st: { def: 16, hp: 20 } },
  tunique: { place: 'armure', v: 5, st: { def: 2 } },
  cuir: { place: 'armure', v: 20, st: { def: 4, hp: 5 } },
  mailles: { place: 'armure', prix: 55, st: { def: 7, spd: -1 }, classes: ['guerrier', 'chevalier', 'berserker'] },
  robe: { place: 'armure', prix: 45, st: { def: 3, mag: 3, pp: 5 }, classes: MAGES },
  brigandine: { place: 'armure', prix: 120, st: { def: 10, hp: 10, spd: -1 }, classes: ['guerrier', 'chevalier', 'berserker'] },
  cape: { place: 'armure', prix: 100, st: { def: 5, mag: 4, pp: 8 }, classes: MAGES },
  veste: { place: 'armure', prix: 150, st: { def: 8, spd: 2 } },
  plates: { place: 'armure', prix: 420, st: { def: 20, hp: 20, spd: -2 }, classes: ['guerrier', 'chevalier', 'berserker'] },
  manteau: { place: 'armure', prix: 380, st: { def: 12, mag: 8, pp: 12 }, classes: MAGES },
  salamandre: { place: 'armure', prix: 360, st: { def: 13, hp: 10, spd: 2 } },
  nacre: { place: 'armure', prix: 260, st: { def: 14, hp: 15, spd: -1 }, classes: ['guerrier', 'chevalier', 'berserker'] },
  houle: { place: 'armure', prix: 220, st: { def: 8, mag: 6, pp: 10 }, classes: MAGES },
  plume: { place: 'acc', v: 25, st: { spd: 2 } },
  anneau: { place: 'acc', v: 30, st: { mag: 3 } },
  eclat: { place: 'acc', v: 40, st: { atk: 4 } },
  talisman: { place: 'acc', v: 35, st: { def: 3, hp: 8 } },
  corne: { place: 'acc', v: 50, st: { atk: 3, def: 2 } },
  medaillon: { place: 'acc', cadeau: true, st: { hp: 10 } },
  perle: { place: 'acc', v: 60, st: { mag: 4, pp: 6 } },
  ecaille: { place: 'acc', v: 70, st: { def: 4, hp: 12 } },
  rose: { place: 'acc', v: 55, st: { spd: 3 } },
  dent: { place: 'acc', v: 80, st: { atk: 6 } },
  cloche: { place: 'acc', v: 90, st: { def: 3, mag: 3, spd: 1 } },
  griffe: { place: 'acc', v: 100, st: { atk: 7 } },
  filon: { place: 'acc', v: 100, st: { def: 5, hp: 15 } },
  lave: { place: 'acc', v: 120, st: { atk: 3, mag: 6 } },
  // Lampe de mineur (« Les mineurs disparus ») : plus de découvertes avec Explorer (voir zone.js)
  lampe: { place: 'acc', cadeau: true, st: { def: 2 }, lampe: true },
  // Bouclier d'Aldric (« Le carnet d'Aldric ») : le jeu n'a pas d'emplacement de bouclier, c'est un accessoire
  bouclier: { place: 'acc', cadeau: true, st: { def: 8, hp: 25 } }
};

// Objets importants (onglet « Importants » de l'inventaire), dans l'ordre d'affichage.
// mystere : condition ; tant qu'elle est fausse, l'objet s'affiche « ??? » (l'œuf de wyverne attend l'acte 4).
const IMPORTANTS = {
  'eclat-lanterne': {},
  insigne: {},
  coeur: {},
  croc: {},
  'epee-pere': {},  // l'épée d'Aldric, le père de Kael : reforgée à l'acte 3, rendue à son père à l'acte 4
  // acte 2
  'journal-bord': {},
  'lettre-orvan': {},
  // quêtes annexes de la côte
  'journal-salicorne': {},
  'pages-registre': {},
  registre: {},
  boite: {},          // la boîte à musique de Naïa (« La berceuse », réparée par Hilde à l'acte 3)
  // quêtes annexes de la vallée : graine-lanterne, carnet du chasseur, colporteur
  graine: {},
  pousse: {},
  defense: {},
  'ecaille-orage': {},
  miel: {},
  boussole: {},
  'perle-grise': {},
  'corne-brume': {},
  // acte 3
  'epee-aldric': {},  // l'épée du père reforgée par Hilde
  // quêtes annexes de Cendre (et suite de celles de la vallée)
  bourgeon: {},
  'peau-salamandre': {},
  lingot: {},
  'plume-roc': {},
  'boite-reparee': {},
  pierre: {},
  'cristal-chantant': {},
  'casque-mineur': {},
  moule: {},          // « Le premier moule » : le moule de la première cage, puis le métal ardent
  'metal-ardent': {},
  'page-aldric': {},  // « Le carnet d'Aldric » : une page, puis deux, trois, et le carnet complet
  'pages-aldric2': {},
  'pages-aldric3': {},
  'carnet-aldric': {},
  oeuf: { mystere: 'drapeau acte4' }
};
