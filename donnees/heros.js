/* Lanterval · Héros, classes et techniques.
   Les noms, âges et descriptions sont dans textes/<langue>/noms.txt (heros.<id>, classe.<id>, tech.<id>).
   Éléments : L Lame, T Terre, F Feu, E Eau. L'élément reste attaché au héros quelle que soit sa classe. */

const HEROS = {
  // base : statistiques au niveau 1 ; gain : ce qui s'ajoute à chaque niveau
  kael: { el: 'T', classe: 'apprenti', arme: 'dague',
    base: { hp: 60, pp: 10, atk: 11, mag: 6, def: 7, spd: 10 }, gain: { hp: 8, pp: 2, atk: 2.4, mag: 1, def: 1.4, spd: .7 } },
  mira: { el: 'F', classe: 'mage', arme: 'baton',
    base: { hp: 48, pp: 18, atk: 8, mag: 12, def: 5, spd: 11 }, gain: { hp: 6, pp: 3, atk: 1.2, mag: 2.4, def: 1, spd: .8 } },
  sol: { el: 'E', classe: 'soigneur', arme: 'baton',
    base: { hp: 54, pp: 16, atk: 8, mag: 10, def: 6, spd: 12 }, gain: { hp: 7, pp: 3, atk: 1.2, mag: 2, def: 1.2, spd: .8 } }
};
// ordre d'affichage dans l'équipe
const ORDRE_HEROS = ['kael', 'mira', 'sol'];

const CLASSES = {
  // mod : multiplicateurs de statistiques ; tech : techniques ; armes : types d'armes portables
  apprenti: { mod: {}, tech: ['frappe'], armes: ['dague', 'epee', 'baton'] },
  guerrier: { mod: { hp: 1.2, atk: 1.25, mag: .7, def: 1.1, pp: .6 }, tech: ['frappe', 'provoc'], armes: ['dague', 'epee'] },
  mage: { mod: { hp: .85, pp: 1.4, atk: .7, mag: 1.35, def: .85 }, tech: ['sort', 'deluge'], armes: ['dague', 'baton'] },
  soigneur: { mod: { pp: 1.3, atk: .8, mag: 1.15, def: 1.05 }, tech: ['soin', 'soins'], armes: ['baton'] },
  chevalier: { mod: { hp: 1.3, atk: 1.2, def: 1.35, mag: .7, spd: .9, pp: .7 }, tech: ['sacree', 'rempart'], armes: ['epee'] },
  rodeur: { mod: { hp: .95, atk: 1.15, spd: 1.3, def: .9, pp: .8 }, tech: ['double', 'lynx'], armes: ['dague', 'arc'], cachee: true }
};

const TECHNIQUES = {
  // el : X = élément du héros, LX = Lame + élément ; cible : ennemi, tous, allie, allies, soi, hasard2 ; poids : lenteur du tour
  frappe: { el: 'X', type: 'phys', pow: 1.3, pp: 2, cible: 'ennemi', poids: 1 },
  provoc: { type: 'provoc', pp: 0, cible: 'soi', poids: .8 },
  sort: { el: 'X', type: 'mag', pow: 1.3, pp: 3, cible: 'ennemi', poids: 1 },
  deluge: { el: 'X', type: 'mag', pow: .85, pp: 8, cible: 'tous', poids: 1.4 },
  soin: { type: 'soin', pow: 1.6, pp: 4, cible: 'allie', poids: 1 },
  soins: { type: 'soins', pow: .9, pp: 9, cible: 'allies', poids: 1.3 },
  sacree: { el: 'LX', type: 'phys', pow: 1.5, pp: 4, cible: 'ennemi', poids: 1.1 },
  rempart: { type: 'rempart', pp: 5, cible: 'soi', poids: 1 },
  double: { el: 'L', type: 'phys', pow: .8, pp: 3, cible: 'hasard2', poids: 1 },
  lynx: { type: 'scan', pp: 1, cible: 'ennemi', poids: .5 }
};
