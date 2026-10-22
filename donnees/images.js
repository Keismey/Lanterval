/* Lanterval · Toutes les images du jeu.
   fichier : image définitive dans img/ (préparée par outils/images.py) ;
   portrait : visage carré pour les avatars ;
   provisoire : dessin de la maquette utilisé tant que le fichier manque ;
   sujet : ce que l'image doit montrer (pour le prompt Gemini) ;
   lueur : position du cristal de la lanterne dans l'image (en part de la largeur et de la hauteur).
   Sans fichier ni dessin provisoire, le jeu affiche un cadre avec le sujet. */

const IMAGES = {
  // ---------- Décors ----------
  'decor.lanterval': { fichier: 'img/decors/lanterval.webp', lueur: [.503, .29], sujet: 'La place de Lanterval et sa lanterne monumentale, de jour' },
  'decor.foret': { provisoire: 'foret', sujet: 'Forêt des Murmures, troncs immenses et brume épaisse' },
  'decor.foret.calme': { provisoire: 'foret-calme', sujet: 'Forêt des Murmures, brume levée, lucioles' },
  'decor.grotte': { provisoire: 'grotte', sujet: 'Grotte de Cristal, cristaux bleus lumineux' },
  'decor.grotte.sombre': { provisoire: 'grotte-sombre', sujet: 'Grotte de Cristal, cristaux éteints, yeux rouges dans le noir' },
  'decor.col': { provisoire: 'col', sujet: 'Col des Pierres, sentier entre des menhirs, neige et ciel ambré' },
  'decor.col.vide': { provisoire: 'col-vide', sujet: 'Col des Pierres, socle vide du cristal, ciel gris' },
  'decor.carte': { provisoire: 'carte', sujet: 'Carte de la Vallée de Lanterval' },

  // ---------- Panoramas (format large ~2,4:1) ----------
  'pano.ouverture': { sujet: 'Lanterval au crépuscule, la lanterne vacille' },
  'pano.mira-loups': { sujet: 'Mira dos à un arbre, trois loups autour d\'elle' },
  'pano.insigne': { sujet: 'L\'insigne à l\'œil fermé dans un gant' },
  'pano.lac-sol': { sujet: 'Le lac souterrain, Sol de dos' },
  'pano.gardien': { sujet: 'Le Gardien de cristal se dresse' },
  'pano.fete': { fichier: 'img/panoramas/fete-lanterne.webp', sujet: 'La lanterne rallumée, fête sur la place' },
  'pano.cage': { sujet: 'Varen et le Sans-Nom encagent le cristal d\'ambre au sommet du col' },
  'pano.epee': { sujet: 'Brann tend l\'épée du père à Kael, au poste de garde' },
  'pano.loup-alpha': { sujet: 'Le Loup alpha sur un rocher, sous la lune et la brume' },

  // ---------- Héros (tournés vers la gauche) ----------
  'heros.kael': { fichier: 'img/heros/kael.webp', portrait: 'img/heros/kael-portrait.webp', provisoire: 'kael', sujet: 'Kael, 17 ans, apprenti garde, cape bleue' },
  'heros.mira': { provisoire: 'mira', sujet: 'Mira, 18 ans, cheveux roux, flammes dans les mains' },
  'heros.sol': { provisoire: 'sol', sujet: 'Sol, 20 ans, cheveux bleus, bâton' },

  // ---------- Personnages du village (portraits) ----------
  'pnj.orvan': { provisoire: 'f_orvan', sujet: 'L\'Ancien Orvan, vieil homme à barbe blanche' },
  'pnj.brann': { provisoire: 'f_brann', sujet: 'Brann, le garde, casque et moustache' },
  'pnj.aubergiste': { provisoire: 'f_aub', sujet: 'L\'aubergiste du Chaudron' },
  'pnj.berthe': { provisoire: 'f_berthe', sujet: 'Berthe, marchande rousse au foulard jaune' },
  'pnj.nell': { provisoire: 'f_nell', sujet: 'Nell, herboriste à capuche verte' },
  'pnj.tilo': { provisoire: 'f_tilo', sujet: 'Tilo, petit garçon du village' },
  'pnj.hilde': { provisoire: 'f_hilde', sujet: 'Hilde, forgeronne, cheveux roux tressés, tablier de cuir' },
  'pnj.varen': { provisoire: 'f_varen', sujet: 'Varen, jeune homme de l\'Ordre, cheveux argentés, sourire arrogant' },
  'pnj.sansnom': { provisoire: 'f_sansnom', sujet: 'Le Sans-Nom, colosse au masque d\'acier à l\'œil fermé' },
  'pnj.silhouette': { provisoire: 'f_inconnu', sujet: 'Silhouette encapuchonnée de l\'Ordre, yeux rouges' },

  // ---------- Monstres (tournés vers la droite) ----------
  'monstre.loup': { fichier: 'img/monstres/loup.webp', provisoire: 'loup', sujet: 'Loup des brumes' },
  'monstre.spore': { provisoire: 'spore', sujet: 'Champi-spore' },
  'monstre.chauve': { provisoire: 'chauve', sujet: 'Chiroptère' },
  'monstre.gelee': { provisoire: 'gelee', sujet: 'Gelée de quartz' },
  'monstre.ombre': { provisoire: 'ombre', sujet: 'Ombre voleuse de l\'Ordre' },
  'monstre.alpha': { provisoire: 'alpha', sujet: 'Loup alpha à la cicatrice' },
  'monstre.belier': { provisoire: 'belier', sujet: 'Bélier des roches, cornes de pierre' },
  'monstre.harpie': { provisoire: 'harpie', sujet: 'Harpie du col, ailes grises, serres' },
  'monstre.varen': { provisoire: 'varen', sujet: 'Varen, lame courbe, cape de l\'Ordre' },
  'monstre.sansnom': { provisoire: 'sansnom', sujet: 'Le Sans-Nom, colosse masqué et sa masse' },
  'monstre.golem': { provisoire: 'golem', sujet: 'Gardien de cristal, colosse de roche et de cristal' }
};
