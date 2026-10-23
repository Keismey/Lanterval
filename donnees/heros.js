/* Lanterval · Héros, classes et techniques.
   Les noms, âges et descriptions sont dans textes/<langue>/noms.txt (heros.<id>, classe.<id>, tech.<id>).
   Éléments : L Lame, T Terre, F Feu, E Eau, V Vent. L'élément reste attaché au héros quelle que soit sa classe. */

const HEROS = {
  // base : statistiques au niveau 1 ; gain : ce qui s'ajoute à chaque niveau ; armure : armure de départ (tunique sinon)
  kael: { el: 'T', classe: 'apprenti', arme: 'dague',
    base: { hp: 60, pp: 10, atk: 11, mag: 6, def: 7, spd: 10 }, gain: { hp: 8, pp: 2, atk: 2.4, mag: 1, def: 1.4, spd: .7 } },
  mira: { el: 'F', classe: 'mage', arme: 'baton',
    base: { hp: 48, pp: 18, atk: 8, mag: 12, def: 5, spd: 11 }, gain: { hp: 6, pp: 3, atk: 1.2, mag: 2.4, def: 1, spd: .8 } },
  sol: { el: 'E', classe: 'soigneur', arme: 'baton',
    base: { hp: 54, pp: 16, atk: 8, mag: 10, def: 6, spd: 12 }, gain: { hp: 7, pp: 3, atk: 1.2, mag: 2, def: 1.2, spd: .8 } },
  // acte 3 : Nev rejoint dans les Champs brûlés, en Moine
  nev: { el: 'V', classe: 'moine', arme: 'bandes', armure: 'veste',
    base: { hp: 52, pp: 14, atk: 10, mag: 9, def: 6, spd: 14 }, gain: { hp: 7, pp: 2.5, atk: 2, mag: 1.6, def: 1.2, spd: 1 } },
  // invitée : se bat avec l'équipe dans certains combats de quête (['combat', …, { invitee: 'hilde' }]),
  // au niveau de Kael ; elle n'est pas dans le menu Équipe et ne gagne pas d'expérience
  hilde: { el: 'F', classe: 'forgeronne', arme: 'marteau', armure: 'tablier', invite: true,
    base: { hp: 62, pp: 12, atk: 12, mag: 6, def: 8, spd: 9 }, gain: { hp: 8.5, pp: 2, atk: 2.4, mag: 1, def: 1.5, spd: .8 } },
  // acte 4 : Varen, invité après le Pic hurlant (drapeau varen) : il se bat dans tous les combats, sauf les duels
  // et ceux où une autre invitée est là (voir battle dans moteur/combat.js)
  varen: { el: 'V', classe: 'duelliste', arme: 'courbe', armure: 'cuirnoir', invite: true,
    base: { hp: 58, pp: 12, atk: 12, mag: 7, def: 7, spd: 14 }, gain: { hp: 7.5, pp: 2, atk: 2.3, mag: 1.1, def: 1.3, spd: 1 } }
};
// ordre d'affichage dans l'équipe
const ORDRE_HEROS = ['kael', 'mira', 'sol', 'nev'];

const CLASSES = {
  // mod : multiplicateurs de statistiques ; tech : techniques ; armes : types d'armes portables
  apprenti: { mod: {}, tech: ['frappe'], armes: ['dague', 'epee', 'baton'] },
  guerrier: { mod: { hp: 1.2, atk: 1.25, mag: .7, def: 1.1, pp: .6 }, tech: ['frappe', 'provoc'], armes: ['dague', 'epee'] },
  mage: { mod: { hp: .85, pp: 1.4, atk: .7, mag: 1.35, def: .85 }, tech: ['sort', 'deluge'], armes: ['dague', 'baton'] },
  soigneur: { mod: { pp: 1.3, atk: .8, mag: 1.15, def: 1.05 }, tech: ['soin', 'soins'], armes: ['baton'] },
  chevalier: { mod: { hp: 1.3, atk: 1.2, def: 1.35, mag: .7, spd: .9, pp: .7 }, tech: ['sacree', 'rempart'], armes: ['epee'] },
  // acte 2 : débloquées par le cristal d'écume
  moine: { mod: { hp: 1.15, atk: 1.2, spd: 1.1, mag: .6, pp: .7 }, tech: ['rafale', 'meditation'], armes: ['poing', 'baton'] },
  voleur: { mod: { hp: .9, atk: 1.05, def: .9, spd: 1.45, mag: .8, pp: .8 }, tech: ['vol', 'esquive'], armes: ['dague'] },
  barde: { mod: { hp: .9, atk: .8, mag: 1.2, pp: 1.3 }, tech: ['courage', 'berceuse'], armes: ['harpe', 'dague'] },
  // acte 3 : débloquées par le cristal de braise
  berserker: { mod: { hp: 1.25, atk: 1.4, def: .8, mag: .5, pp: .6 }, tech: ['furie', 'rage'], armes: ['hache', 'epee'] },
  alchimiste: { mod: { pp: 1.2, atk: .9, mag: 1.15 }, tech: ['corrosion', 'mixture'], armes: ['dague', 'baton'] },
  invocateur: { mod: { hp: .85, pp: 1.5, atk: .6, mag: 1.45, def: .85, spd: .9 }, tech: ['invocation', 'offrande'], armes: ['baton', 'harpe'] },
  // acte 4 : débloquées par le cristal d'azur
  sage: { mod: { hp: .95, pp: 1.4, atk: .7, mag: 1.35 }, tech: ['priere', 'jugement'], armes: ['baton', 'harpe'] },
  ninja: { mod: { hp: .95, atk: 1.25, def: .9, spd: 1.4, mag: .9, pp: .8 }, tech: ['kunai', 'ninjutsu'], armes: ['dague', 'poing'] },
  lamemage: { mod: { hp: 1.1, atk: 1.15, mag: 1.15 }, tech: ['tranchesort', 'enchant'], armes: ['epee', 'dague'] },
  // classes cachées (quêtes annexes)
  rodeur: { mod: { hp: .95, atk: 1.15, spd: 1.3, def: .9, pp: .8 }, tech: ['double', 'lynx'], armes: ['dague', 'arc'], cachee: true },
  // corsaire : vole parfois en frappant, dégâts doublés sur une garde brisée (pirate dans combat.js)
  corsaire: { mod: { hp: 1.05, atk: 1.2, spd: 1.15, mag: .7, pp: .8 }, tech: ['abordage', 'vol'], armes: ['sabre', 'dague'], cachee: true, pirate: true },
  // géomancien : ses sorts prennent l'élément de la région (Terre dans la vallée, Eau sur la côte, Feu à Cendre)
  geomancien: { mod: { pp: 1.25, atk: .8, mag: 1.3 }, tech: ['terroir', 'eboulement'], armes: ['baton'], cachee: true },
  // classe d'une invitée (Hilde) : jamais débloquée, absente du Codex et du menu Équipe
  forgeronne: { mod: { hp: 1.2, atk: 1.2, def: 1.2, mag: .7 }, tech: ['marteau', 'trempe'], armes: ['marteau'], invite: true },
  // classe de Varen (invité)
  duelliste: { mod: { hp: 1.15, atk: 1.25, spd: 1.15, mag: .8 }, tech: ['croisee', 'parade'], armes: ['sabre'], invite: true }
};

const TECHNIQUES = {
  // el : X = élément du héros, LX = Lame + élément, Z = élément de la région ; cible : ennemi, tous, allie, allies, soi, hasard2 ; poids : lenteur du tour
  // types : phys, mag, soin, soins, provoc, rempart, scan, meditation (PV et PP du héros), vol (objet ou or),
  //         esquive (évite le prochain coup), courage (Attaque et Magie de l'équipe +25 % pendant 3 actions), sommeil,
  //         rage (Attaque +40 %, Défense −30 % pendant 3 actions), mixture (soigne l'équipe et rend 4 PP),
  //         offrande (le héros donne 15 % de ses PV, l'allié gagne 15 PP),
  //         enchant (l'Attaque du héros prend son élément pendant 3 actions)
  // recul : part des PV max que le héros perd en frappant ; corrode : enlève un point de garde même sans faiblesse ;
  // mixte : coup physique qui compte aussi la Magie (moyenne de l'Attaque et de la Magie)
  frappe: { el: 'X', type: 'phys', pow: 1.3, pp: 2, cible: 'ennemi', poids: 1 },
  provoc: { type: 'provoc', pp: 0, cible: 'soi', poids: .8 },
  sort: { el: 'X', type: 'mag', pow: 1.3, pp: 3, cible: 'ennemi', poids: 1 },
  deluge: { el: 'X', type: 'mag', pow: .85, pp: 8, cible: 'tous', poids: 1.4 },
  soin: { type: 'soin', pow: 1.6, pp: 4, cible: 'allie', poids: 1 },
  soins: { type: 'soins', pow: .9, pp: 9, cible: 'allies', poids: 1.3 },
  sacree: { el: 'LX', type: 'phys', pow: 1.5, pp: 4, cible: 'ennemi', poids: 1.1 },
  rempart: { type: 'rempart', pp: 5, cible: 'soi', poids: 1 },
  double: { el: 'L', type: 'phys', pow: .8, pp: 3, cible: 'hasard2', poids: 1 },
  lynx: { type: 'scan', pp: 1, cible: 'ennemi', poids: .5 },
  // coups : nombre de frappes sur la même cible
  rafale: { el: 'X', type: 'phys', pow: .55, coups: 3, pp: 5, cible: 'ennemi', poids: 1.1 },
  meditation: { type: 'meditation', pp: 0, cible: 'soi', poids: 1 },
  vol: { type: 'vol', pp: 2, cible: 'ennemi', poids: .7 },
  esquive: { type: 'esquive', pp: 3, cible: 'soi', poids: .6 },
  courage: { type: 'courage', pp: 6, cible: 'allies', poids: 1 },
  berceuse: { type: 'sommeil', pp: 5, cible: 'ennemi', poids: 1 },
  abordage: { el: 'L', type: 'phys', pow: 1.45, pp: 4, cible: 'ennemi', poids: 1.1 },
  // acte 3
  furie: { el: 'L', type: 'phys', pow: 2.1, pp: 6, cible: 'ennemi', poids: 1.2, recul: .1 },
  rage: { type: 'rage', pp: 4, cible: 'soi', poids: .7 },
  corrosion: { el: 'X', type: 'mag', pow: .9, pp: 5, cible: 'ennemi', poids: 1, corrode: true },
  mixture: { type: 'mixture', pow: .7, pp: 10, cible: 'allies', poids: 1.2 },
  invocation: { el: 'X', type: 'mag', pow: 1.35, pp: 16, cible: 'tous', poids: 1.7 },
  offrande: { type: 'offrande', pp: 0, cible: 'allie', poids: .8 },
  terroir: { el: 'Z', type: 'mag', pow: 1.5, pp: 5, cible: 'ennemi', poids: 1 },
  eboulement: { el: 'Z', type: 'mag', pow: .95, pp: 10, cible: 'tous', poids: 1.3 },
  // acte 4
  priere: { type: 'soins', pow: 1.3, pp: 14, cible: 'allies', poids: 1.3 },
  jugement: { el: 'X', type: 'mag', pow: 1.85, pp: 8, cible: 'ennemi', poids: 1.15 },
  kunai: { el: 'L', type: 'phys', pow: .8, pp: 6, cible: 'tous', poids: 1 },
  ninjutsu: { el: 'X', type: 'mag', pow: 1.3, pp: 6, cible: 'ennemi', poids: .9, corrode: true },
  tranchesort: { el: 'LX', type: 'phys', mixte: true, pow: 1.45, pp: 5, cible: 'ennemi', poids: 1.05 },
  enchant: { type: 'enchant', pp: 4, cible: 'soi', poids: .7 },
  // Hilde (invitée)
  marteau: { el: 'L', type: 'phys', pow: 1.6, pp: 4, cible: 'ennemi', poids: 1.1, corrode: true },
  trempe: { type: 'rempart', pp: 5, cible: 'soi', poids: 1 },
  // Varen (invité)
  croisee: { el: 'L', type: 'phys', pow: .85, coups: 2, pp: 4, cible: 'ennemi', poids: 1 },
  parade: { type: 'esquive', pp: 3, cible: 'soi', poids: .6 }
};
// élément de chaque région (techniques du Géomancien)
const ELEMENT_REGION = { vallee: 'T', cote: 'E', cendre: 'F', vents: 'V' };
