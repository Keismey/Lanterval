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
  'decor.foret': { fichier: 'img/decors/foret.webp', provisoire: 'foret', sujet: 'Forêt des Murmures, troncs immenses et brume épaisse' },
  'decor.foret.calme': { fichier: 'img/decors/foret-calme.webp', provisoire: 'foret-calme', sujet: 'Forêt des Murmures, brume levée, lucioles' },
  'decor.grotte': { fichier: 'img/decors/grotte.webp', provisoire: 'grotte', sujet: 'Grotte de Cristal, cristaux bleus lumineux' },
  'decor.grotte.sombre': { fichier: 'img/decors/grotte-sombre.webp', provisoire: 'grotte-sombre', sujet: 'Grotte de Cristal, cristaux éteints, yeux rouges dans le noir' },
  'decor.col': { fichier: 'img/decors/col.webp', provisoire: 'col', sujet: 'Col des Pierres, sentier entre des menhirs, neige et ciel ambré' },
  'decor.col.vide': { fichier: 'img/decors/col-vide.webp', provisoire: 'col-vide', sujet: 'Col des Pierres, socle vide du cristal, ciel gris' },
  'decor.carte': { fichier: 'img/decors/carte.webp', provisoire: 'carte', sujet: 'Carte de la Vallée de Lanterval' },
  'decor.marais': { provisoire: 'marais', sujet: 'Marais salant, bassins de sel blanc, roseaux et brume basse, cabane de saunier' },
  'decor.salvent': { provisoire: 'salvent', sujet: 'Salvent, port de pêche sous la brume, quais de bois, barques, phare au loin' },
  'decor.salvent.libre': { provisoire: 'salvent-libre', sujet: 'Salvent sous un ciel dégagé, le phare brille au loin' },
  'decor.lanternes': { provisoire: 'lanternes', sujet: 'Marais des Lanternes, eaux sombres, trois petites lanternes éteintes sur des pieux' },
  'decor.lanternes.allume': { provisoire: 'lanternes-allume', sujet: 'Marais des Lanternes, trois petites lanternes allumées sur des pieux, brume dorée' },
  'decor.epave': { provisoire: 'epave', sujet: 'Épave engloutie, coque de navire sous l\'eau, rayons de lumière, algues' },
  'decor.phare': { provisoire: 'phare', sujet: 'Phare noyé sur un rocher, mer haute, bannières de l\'Ordre' },
  'decor.phare.libre': { provisoire: 'phare-libre', sujet: 'Phare noyé, la lumière brille, mer calme' },
  'decor.carte.cote': { provisoire: 'carte-cote', sujet: 'Carte de la Côte de Salvent' },

  // ---------- Panoramas (format large ~2,4:1) ----------
  'pano.ouverture': { fichier: 'img/panoramas/ouverture.webp', sujet: 'Lanterval au crépuscule, la lanterne vacille' },
  'pano.mira-loups': { fichier: 'img/panoramas/mira-loups.webp', sujet: 'Mira dos à un arbre, trois loups autour d\'elle' },
  'pano.insigne': { fichier: 'img/panoramas/insigne.webp', sujet: 'L\'insigne à l\'œil fermé dans un gant' },
  'pano.lac-sol': { fichier: 'img/panoramas/lac-sol.webp', sujet: 'Le lac souterrain, Sol de dos' },
  'pano.gardien': { fichier: 'img/panoramas/gardien.webp', sujet: 'Le Gardien de cristal se dresse' },
  'pano.fete': { fichier: 'img/panoramas/fete-lanterne.webp', sujet: 'La lanterne rallumée, fête sur la place' },
  'pano.cage': { fichier: 'img/panoramas/cage.webp', sujet: 'Varen et le Sans-Nom encagent le cristal d\'ambre au sommet du col' },
  'pano.epee': { fichier: 'img/panoramas/epee.webp', sujet: 'Brann tend l\'épée du père à Kael, au poste de garde' },
  'pano.loup-alpha': { fichier: 'img/panoramas/loup-alpha.webp', sujet: 'Le Loup alpha sur un rocher, sous la lune et la brume' },
  'pano.salvent': { sujet: 'Salvent sous la brume, le port vu d\'en haut' },
  'pano.epave': { sujet: 'L\'épave sous l\'eau, rayons de lumière, Sol qui plonge' },
  'pano.naia': { sujet: 'Naïa sur le quai, le phare noyé au loin' },
  'pano.phare': { sujet: 'Le phare noyé aux mains de l\'Ordre, Nev sur l\'escalier' },
  'pano.vision': { sujet: 'Vision : Ysold et le jeune Orvan côte à côte, devant l\'Œil' },
  'pano.rosal': { sujet: 'Rosal à la barre de la Salicorne, voiles dans la brume' },

  // ---------- Héros (tournés vers la gauche) ----------
  'heros.kael': { fichier: 'img/heros/kael.webp', portrait: 'img/heros/kael-portrait.webp', provisoire: 'kael', sujet: 'Kael, 17 ans, apprenti garde, cape bleue' },
  'heros.mira': { fichier: 'img/heros/mira.webp', portrait: 'img/heros/mira-portrait.webp', provisoire: 'mira', sujet: 'Mira, 18 ans, cheveux roux, flammes dans les mains' },
  'heros.sol': { fichier: 'img/heros/sol.webp', portrait: 'img/heros/sol-portrait.webp', provisoire: 'sol', sujet: 'Sol, 20 ans, cheveux bleus, bâton' },

  // ---------- Personnages du village (portraits) ----------
  'pnj.orvan': { fichier: 'img/pnj/orvan.webp', portrait: 'img/pnj/orvan.webp', provisoire: 'f_orvan', sujet: 'L\'Ancien Orvan, vieil homme à barbe blanche' },
  'pnj.brann': { fichier: 'img/pnj/brann.webp', portrait: 'img/pnj/brann.webp', provisoire: 'f_brann', sujet: 'Brann, le garde, casque et moustache' },
  'pnj.aubergiste': { fichier: 'img/pnj/aubergiste.webp', portrait: 'img/pnj/aubergiste.webp', provisoire: 'f_aub', sujet: 'L\'aubergiste du Chaudron' },
  'pnj.berthe': { fichier: 'img/pnj/berthe.webp', portrait: 'img/pnj/berthe.webp', provisoire: 'f_berthe', sujet: 'Berthe, marchande rousse au foulard jaune' },
  'pnj.nell': { fichier: 'img/pnj/nell.webp', portrait: 'img/pnj/nell.webp', provisoire: 'f_nell', sujet: 'Nell, herboriste à capuche verte' },
  'pnj.tilo': { fichier: 'img/pnj/tilo.webp', portrait: 'img/pnj/tilo.webp', provisoire: 'f_tilo', sujet: 'Tilo, petit garçon du village' },
  'pnj.hilde': { fichier: 'img/pnj/hilde.webp', portrait: 'img/pnj/hilde.webp', provisoire: 'f_hilde', sujet: 'Hilde, forgeronne, cheveux roux tressés, tablier de cuir' },
  'pnj.varen': { fichier: 'img/pnj/varen.webp', portrait: 'img/pnj/varen.webp', provisoire: 'f_varen', sujet: 'Varen, jeune homme de l\'Ordre, cheveux argentés, sourire arrogant' },
  'pnj.sansnom': { fichier: 'img/pnj/sansnom.webp', portrait: 'img/pnj/sansnom.webp', provisoire: 'f_sansnom', sujet: 'Le Sans-Nom, colosse au masque d\'acier à l\'œil fermé' },
  'pnj.silhouette': { fichier: 'img/pnj/silhouette.webp', portrait: 'img/pnj/silhouette.webp', provisoire: 'f_inconnu', sujet: 'Silhouette encapuchonnée de l\'Ordre, yeux rouges' },
  'pnj.maelle': { provisoire: 'f_maelle', sujet: 'Maëlle, vieille aubergiste de Salvent, chignon gris, châle bleu' },
  'pnj.gaspard': { provisoire: 'f_gaspard', sujet: 'Gaspard, marchand rond et chauve, lunettes, air perdu' },
  'pnj.loic': { provisoire: 'f_loic', sujet: 'Loïc, pêcheur, bonnet de laine, barbe rousse' },
  'pnj.rosal': { provisoire: 'f_rosal', sujet: 'Rosal, vieille capitaine corsaire, tricorne, cache-œil' },
  'pnj.naia': { provisoire: 'f_naia', sujet: 'Naïa, 16 ans, cheveux bleus comme Sol, ciré jaune' },
  'pnj.nev': { provisoire: 'f_nev', sujet: 'Nev, 16 ans, novice de l\'Ordre, cheveux blancs courts, capuche' },
  'pnj.heraut': { provisoire: 'f_heraut', sujet: 'Le Héraut de la Paupière, casque à l\'œil fermé, cape violette' },
  'pnj.pecheur': { provisoire: 'f_loic', sujet: 'Loïc, pêcheur, bonnet de laine, barbe rousse (même portrait que pnj.loic)' },
  'pnj.bosco': { provisoire: 'f_bosco', sujet: 'Le Bosco, contrebandier, bandana rouge, moustache' },
  'pnj.erwan': { provisoire: 'f_erwan', sujet: 'Erwan, gardien du phare, vieil homme, ciré et barbe grise' },
  'pnj.pia': { provisoire: 'f_pia', sujet: 'Pia, 9 ans, petite jardinière, nattes brunes, tablier vert, arrosoir' },
  'pnj.roxane': { provisoire: 'f_roxane', sujet: 'Roxane, chasseuse, la quarantaine, cheveux noirs courts, cicatrice sur la joue, manteau de fourrure' },
  'pnj.fennel': { provisoire: 'f_fennel', sujet: 'Fennel, colporteur souriant, chapeau à large bord, hotte chargée de bibelots' },
  'pnj.ysold': { provisoire: 'f_ysold', sujet: 'Ysold, fondatrice de l\'Ordre, femme au regard calme, cheveux argentés, robe violette (vue jeune dans une vision)' },

  // ---------- Monstres (tournés vers la droite) ----------
  'monstre.loup': { fichier: 'img/monstres/loup.webp', provisoire: 'loup', sujet: 'Loup des brumes' },
  'monstre.spore': { fichier: 'img/monstres/spore.webp', provisoire: 'spore', sujet: 'Champi-spore' },
  'monstre.chauve': { fichier: 'img/monstres/chauve.webp', provisoire: 'chauve', sujet: 'Chiroptère' },
  'monstre.gelee': { fichier: 'img/monstres/gelee.webp', provisoire: 'gelee', sujet: 'Gelée de quartz' },
  'monstre.ombre': { fichier: 'img/monstres/ombre.webp', provisoire: 'ombre', sujet: 'Ombre voleuse de l\'Ordre' },
  'monstre.alpha': { fichier: 'img/monstres/alpha.webp', provisoire: 'alpha', sujet: 'Loup alpha à la cicatrice' },
  'monstre.belier': { fichier: 'img/monstres/belier.webp', provisoire: 'belier', sujet: 'Bélier des roches, cornes de pierre' },
  'monstre.harpie': { fichier: 'img/monstres/harpie.webp', provisoire: 'harpie', sujet: 'Harpie du col, ailes grises, serres' },
  'monstre.varen': { fichier: 'img/monstres/varen.webp', provisoire: 'varen', sujet: 'Varen, lame courbe, cape de l\'Ordre' },
  'monstre.sansnom': { fichier: 'img/monstres/sansnom.webp', provisoire: 'sansnom', sujet: 'Le Sans-Nom, colosse masqué et sa masse' },
  'monstre.golem': { fichier: 'img/monstres/golem.webp', provisoire: 'golem', sujet: 'Gardien de cristal, colosse de roche et de cristal' },

  // ---------- Monstres de l'acte 2 ----------
  'monstre.crabe': { provisoire: 'crabe', sujet: 'Crabe de sel, carapace couverte de cristaux de sel' },
  'monstre.sangsue': { provisoire: 'sangsue', sujet: 'Sangsue grise géante des marais' },
  'monstre.follet': { provisoire: 'follet', sujet: 'Feu follet, petite flamme bleue avec deux yeux' },
  'monstre.crapaud': { provisoire: 'crapaud', sujet: 'Crapaud des brumes, gros et verdâtre' },
  'monstre.noye': { provisoire: 'noye', sujet: 'Noyé, marin spectral couvert d\'algues' },
  'monstre.poisson': { provisoire: 'poisson', sujet: 'Poisson-lame, nageoires tranchantes' },
  'monstre.soldat': { provisoire: 'soldat', sujet: 'Soldat de l\'Ordre de la Paupière, armure grise, lance' },
  'monstre.vouivre': { provisoire: 'vouivre', sujet: 'Vouivre des marais, serpent ailé vert, gueule ouverte' },
  'monstre.mere': { provisoire: 'mere', sujet: 'Mère-des-abysses, crabe géant couvert de coquillages' },
  'monstre.heraut': { provisoire: 'heraut', sujet: 'Héraut de la Paupière, chevalier en armure violette, masse' },
  'monstre.pie': { provisoire: 'pie', sujet: 'Pie-brume, grande pie grise aux plumes de brume' },
  'monstre.bosco': { provisoire: 'bosco', sujet: 'Le Bosco, contrebandier costaud, crochet et sabre' },
  // bêtes du « Carnet du chasseur »
  'monstre.sanglier': { provisoire: 'sanglier', sujet: 'Sanglier-roc, énorme sanglier au dos couvert de plaques de pierre, défenses blanches' },
  'monstre.anguille': { provisoire: 'anguille', sujet: 'Anguille-tonnerre, longue anguille sombre parcourue d\'éclairs jaunes' }
};
