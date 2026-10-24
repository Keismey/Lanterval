# État du projet

## Version 0.6.8 (2026-10-24) : musiques, lot 4 et jingles

- Lot 4 de Gemini dans son/ : boss, final, emotion, menace, epilogue. Toutes les pistes prévues sont là.
- Musiques de scène : `PANO_MUSIQUE` (donnees/musiques.js) associe un panorama de récit à `emotion`, `menace` ou `epilogue` ; l'événement `panorama` appelle `SON.panorama`, et `decor` (retour au lieu), un combat ou la fin de la séquence remettent la musique du lieu.
- Jingles faits en code (Gemini ne sait pas faire de morceaux de quelques secondes, d'après Keismey) : victoire, défaite, quête annexe finie (`quete`, recit.js), objet important reçu (`objet`, `gagner` dans etat.js), nuit à l'auberge (`auberge`). La musique baisse pendant `DUREE_JINGLE`. Lot 5 de prompts-musique.md abandonné.

## Version 0.6.7 (2026-10-24) : onglet Classe

- Demande de Keismey : Classe et Techniques fusionnés dans `openParty` (onglet `job` : carte de la classe avec ses techniques), bouton « Changer de classe » en bas → vue `job` (liste de toutes les classes, Retour) ; choisir une classe revient à l'onglet avec le message.

## Version 0.6.6 (2026-10-24) : musiques, lot 3

- Lot 3 de Gemini dans son/ : vallee, cote, cendre, vents (zones, par région) et escalier. Reste : boss, final, émotion, menace, épilogue (lot 4) et jingles (lot 5).

## Version 0.6.5 (2026-10-24) : ergonomie des menus

- Maquettes validées par Keismey (Design canvas https://claude.ai/artifact/TKFSxLeSGVdbW7zNnbtXog).
- Village (`renderVillage`) : `.acts.village` en deux colonnes, la quête principale (`main wide`) triée en tête, « Partir » (`.partir`) collé en bas du panneau.
- Boutiques (`boutique`, moteur/village.js) : lignes compactes `ligneArticle` (nom, effet, prix ; visages de l'équipe avec `gainEq` dessous), onglet « Vendre » à la place de l'écran de vente, bourse dans l'en-tête (`show` : options `bourse`, `court` = réplique sur une ligne qui se déplie au toucher, `acts`). Fiches en fenêtre : `ficheEquipement` (comparaison par héros, « Acheter et équiper sur X » sur le meilleur gain, on peut toucher un autre héros) et `ficheObjet` (×1, ×5, ×10).
- Équipe (`openParty`, moteur/menus.js) : en-tête compact (visage, niveau, classe, élément, jauges), onglets Équipement / Classe / Techniques ; « mieux dans le sac » et « Optimiser » (`valeurPour` : Attaque et Magie pondérées par ce que le héros a sans équipement). La bio reste dans le Codex › Personnages ; les objets de soin passent par l'Inventaire.
- Inventaire (`openInv`) : objets en cartes, un bouton par héros avec la jauge utile (PV ou PP) ; équipement en lignes avec filtres et meilleur gain ; bourse dans l'en-tête ; plus de grand vide (`.sheet .acts` sans `margin-top:auto`).

## Version 0.6.4 (2026-10-24) : relecture des textes

- Relecture complète FR (et EN en regard) : Cendre = la région (Plaines de Cendre), Forgecendre = la ville ; Nev « a à peine seize ans » au phare ; prologue « depuis cinquante ans » (la brume naît avec l'Ordre) ; l'Escalier : « ceux qui en sont redescendus n'ont rien raconté » (Orvan en est redescendu) ; Maëlle ne dit plus qu'elle aurait oublié son fils (la brume ne la touche pas) ; plus de « guerre » dans la quête de l'œuf ; conseil « essaie la classe Guerrier » retiré du message de quête (4e mur) ; accords (Vouivre, Mère-des-abysses, sentinelles).
- Combat : `.einfo.seul` (moteur/combat.js, css/jeu.css) : avec un seul ennemi, son nom prend toute la largeur (noms de boss plus coupés).

## Version 0.6.3 (2026-10-24) : musiques, lot 2

- Lot 2 de Gemini dans son/ : brume (Lanterval avant a1.e7), salvent, forgecendre, aerie, voyage (cartes ; aussi les zones tant que leur région n'a pas de piste). Reste : régions, Escalier, boss, final, émotion, menace, épilogue, jingles (lots 3 à 5 de prompts-musique.md).

## Version 0.6.2 (2026-10-24) : générique

- `fin_jeu` joue `generique()` (moteur/recit.js) avant l'écran de fin : plein écran sur `titre.paix`, musique `epilogue`, lignes du repère `generique` (interface.txt ; « ## » titre, « Rôle | Nom ») qui apparaissent une à une ; un appui affiche tout, un appui de plus ferme.

## Version 0.6.1 (2026-10-24) : peaufinage

- Premier chargement léger (sw.js) : à l'installation, seul `BASE` est téléchargé (code, textes, polices, img/studio, img/titre, son/theme.m4a : ~4 Mo) ; le reste se met en cache quand le jeu s'en sert, et la page envoie toutes les 15 s (page visible, sauf mode économie de données) `{ remplir: 3000000 }` : le service worker télécharge ~3 Mo de fichiers manquants dans l'ordre de `FICHIERS` (décors, visages, PNJ, panoramas, monstres, musiques) et répond `{ reste }`.
- Un seul cache `lanterval-fichiers` ; chaque fichier y est rangé sous `<chemin>?h=<empreinte>` (sha1 du contenu, 8 caractères, calculé par outils/construire.js) : une mise à jour ne retélécharge que les fichiers changés, et l'activation retire les entrées périmées. `FICHIERS` = [chemin, empreinte] ; `BASE` = premier chargement.

## Version 0.6.0 (2026-10-24) : musique et bruitages

- Demande de Keismey : musiques générées par lui avec Gemini (prompts : /mnt/project-files/rpg-retro/musique/prompts-musique.md, sources MP3 dans /mnt/project-files/rpg-retro/musique/sources/, nommées NN-<piste>.mp3). `node outils/musiques.js <dossier>` retire les silences, ramène chaque piste à −18 LUFS et écrit son/<piste>.m4a (AAC 96 kb/s).
- donnees/musiques.js : une entrée par piste (`fichier`, `sinon` = piste jouée tant que le fichier manque, `fin` facultatif = point de bouclage). Pistes présentes : voir donnees/musiques.js (`fichier` non nul).
- moteur/son.js (`SON`) : la musique est lue en entier (fetch → blob, donc gardée hors ligne par le service worker), jouée via Web Audio (le volume marche aussi sur iPhone), boucle en fondu enchaîné de 3 s, change de piste en fondu. `SON.ambiance()` (appelé par renderStable et finCombat) choisit la piste du lieu : titre, carte (`voyage`), village (Lanterval embrumé = `brume` tant que l'état n'est pas `fete`), zone (sa piste si elle existe, sinon sa région), fin (`epilogue`). Combat : `combat`, `boss`, `final` (MUSIQUE_FINAL : ysold, paupiere).
- Bruitages fabriqués en Web Audio (aucun fichier) : boutons (doré plus marqué), dialogue suivant, fenêtres, coups, faiblesse, résistance, garde brisée, monstre vaincu, coup reçu, K.O., esquive, soin, bonus, Union, un son par élément (T, F, E, V), or, découverte, palier, niveau ; fanfares de victoire et de défaite en attendant les jingles de Gemini.
- Options › Musique et bruitages : curseurs 0 à 10 (`OPT.musique`, `OPT.bruitages`, 7 par défaut). Le son démarre au premier appui et se coupe quand la page est cachée.

## Version 0.5.5 (2026-10-24) : écran titre

- Aperçu de partage : balises og: et twitter: dans index.html (comme Pas ce soir), image img/affiche.jpg (1200×630, fil des images).
- Demande de Keismey : l'ancien écran titre (scène + panneau) disparaît. Tout est en plein écran par-dessus le jeu (`.accueil`, moteur/jeu.js) : logo Keismey Studio au lancement, puis fond `titre.paix` et « Touche pour commencer », puis fond `titre.brume` (village embrumé sans le cristal ; `titre.paix` une fois `S.finVue`) avec les boutons en liste. Fondu entre les deux fonds.
- Boutons : sans partie, Nouvelle partie (doré) + Options (gris). Avec une partie : Continuer (doré, « Acte N » ou « Fin · Complétion X % »), Nouvelle partie + (bleu brillant, si fin vue, avec confirmation), Nouvelle partie (gris, avec confirmation), Options (gris).
- `completion()` : moitié découvertes de toutes les zones visibles, moitié quêtes annexes finies ; aussi dans le bilan de fin. `S.finPartie` (posé par `fin_jeu`, pas gardé en partie+) dit si la fin a été atteinte dans cette partie ; les anciennes sauvegardes sans partie+ se fient à `finVue`.
- Fonds provisoires dans donnees/images.js (`titre.paix` = fête de la lanterne, `titre.brume` = ouverture, champ `centre` pour le cadrage) : deux images verticales demandées au fil des images.

## Version 0.5.4 (2026-10-24) : peaufinage

- Demande de Keismey : écran d'accueil comme ses autres jeux (même principe qu'Abysses) : au lancement, logo Keismey Studio sur fond noir (2,3 s, un appui le passe), puis l'image du jeu (`pano.ouverture`, fond flouté) avec le titre et « Touche pour commencer » (« Clique » à la souris) ; un appui ouvre l'écran titre habituel (Continuer / Nouvelle partie). `splash()` dans moteur/jeu.js, logo dans img/studio/keismey-studio.webp (copie de celui d'Abysses).
- Bouton retour du téléphone (`retour()` dans moteur/jeu.js) : ferme la fenêtre « Sauvegarde », remonte d'un cran dans une fenêtre (`#m-back`, puis bouton « Retour » de la fenêtre, puis la croix), passe l'écran d'accueil, appuie sur le bouton « Retour » du panneau s'il y en a un (`data-back` posé par `btns` sur les boutons à icône `back` : boutiques, auberge, menus de combat, carte, refus d'une quête) ; sinon rien pendant un dialogue ou un combat ; écran de jeu → fenêtre « Revenir à l'écran titre ? » ; écran titre → « Retourner au hub ? ». `confirmer(cle, oui)` pour ces fenêtres.
- Demande de Keismey : le bouton Options sortait de l'écran à droite sur son téléphone : le temps de jeu quitte la barre du haut (il reste sur l'écran titre, dans le Journal et le bilan de fin), et la bourse peut se réduire.

## Version 0.5.3 (2026-10-23) : le final

- Plan validé par Keismey (« Ok pour tout », 2026-10-23) : https://claude.ai/artifact/NjYEq1ntrxxS94XnKeHMHo
- Quête principale : a4.e8 (pied de l'Escalier de brume : point de non-retour « Monter / Pas encore », Veilleurs de la Paupière), a4.e9 (le Sans-Nom : le combat s'arrête sous 40 % de ses PV, Kael lui tend l'épée et lit le carnet si `annexe aldric 4` ; Aldric retient les Ombres ; soin et point de reprise au sommet), a4.e10 (Ysold et ses quatre cristaux, puis la Paupière du monde contre les quatre héros seuls ; Varen frappé par l'Oubli reste avec Orvan ; l'Œil s'ouvre ; épilogues).
- Épilogues (`['si', condition, alors, sinon]`) : Kael (`annexe aldric 4` : Aldric rentre), Mira (`annexe moule 4`, sinon drapeau `pardon`, sinon « plus tard »), Sol (`annexe berceuse 4`), Nev (`annexe cerfvolant 5` : Varen reste chez Liss), Lanterval fleuri (`annexe graine 5`). Puis `['fin_jeu']`.
- Après la fin : écran de fin (bilan, chronologie) avec « Revenir à Aerie » (juste avant l'Escalier : on garde niveaux, or, objets, équipement ; `retourAvantFinal` dans etat.js retire a4.e8 à a4.e10 des étapes faites), « Partie+ » et l'écran titre. Étoile « fin vue » (`S.finVue`, gardée en partie+, condition `finvue`). Défaite dans le final : relève au palier de l'Escalier, sans perte d'or, l'étape reprend au combat perdu. Réglages dans `FINAL` (acte4.js).
- L'Escalier de brume est une vraie zone (`nonRetour` dans monde.js) : on n'y explore qu'une fois monté, et plus de carte ni de traversée libre jusqu'à la fin. Six découvertes, paliers (Étoile de brume), Veilleur de la Paupière et Nuée d'oubli, décor « sommet » après a4.e9.
- Quête 16 « Les Échos » (`echos`, Garrick, nouveau PNJ d'Aerie) : ouverte par `finvue et annexe chasse 9`. Quatre Échos dans l'ordre qu'on veut (Forêt, Marais des Lanternes, Champs brûlés, Pont des Nuées), puis l'Écho du Sans-Nom au Col des Pierres. Récompense : Talisman de l'écho (le porteur agit le premier, sa première technique est gratuite), 2 000 po, Codex complet (événement `codex`).
- Combat : seuil `fin` (le combat s'arrête sur une scène), capacité `cristaux` (Ysold change de cristal et de faiblesse après chaque action), capacité `oubli` (un héros perd ses techniques pendant 2 actions ; le Sceau de mémoire l'en protège). Conditions : `ou` et `finvue`. Les textes `monstre.<id>.coup` et `.soin` évitent qu'un coup puissant ou un soin reprenne le texte `.special` d'une charge (Héraut, Sans-Nom, Élémentaire de terre).
- Corrections : la fin de l'acte 3 n'affiche plus l'écran « fin de version » ; le « ? » des conseils de boss ne s'affiche plus en double. Les Profondeurs quittent la carte.
- Codex, onglet Personnages : Garrick, et nouvelles infos pour Kael, Mira, Sol, Nev, Orvan, Varen, Aldric (Sans-Nom) et Ysold (conditions `fini a4.e9 ou finvue` pour qu'elles restent après le retour à Aerie).
- Images provisoires : décor de l'Escalier (et du sommet), Veilleur, Nuée d'oubli, Ysold, Paupière du monde (pixel art), visages d'Aldric et de Garrick ; les Échos réutilisent les images des boss d'origine « en brume » (`brume: true`, filtre CSS) ; panoramas en cadre nommé : `pano.aldric`, `pano.ysold`, `pano.oeil`, `pano.epilogue.kael/mira/sol/nev`, `pano.echo`.
- Équilibrage au bot (graines 1 à 9, niveaux 38 à 45) : Sans-Nom entre 0 et 53 % de PV au plus bas, Ysold entre 0 et 60 %, Paupière entre 2 et 65 % (après Ysold, sans repos), Échos entre 0 et 64 %. Le bot ne profite pas du changement de cristal d'Ysold.

## Version 0.5.2 (2026-10-23)

- Quêtes annexes des Hauts-Vents (bible, quêtes 12, 13 et 15 ; plan validé par Keismey) :
  - « L'œuf de wyverne » (`wyverne`, Ilse, dès a4.e2) : l'œuf chaud se trouve en explorant le Volcan endormi ; s'il manque, l'étape du nid brûlant (lézards de lave) le fait trouver et compte la découverte `volcan v6` (événement `trouve`). Boss au pied du Pic hurlant : la Wyverne mère (souffle de brume chargé, double coup tant que sa garde tient). Récompense : classe cachée *Dragonnier* et Lance d'Ilse ; Joran vend ensuite la Lance des falaises. Panorama `pano.wyverne`.
  - « Le cerf-volant » (`cerfvolant`, Liss, nouvelle PNJ d'Aerie, après a4.e7) : grenier, bannière du parvis des Ruines (Nev et Varen seuls contre le Prieur spectral, qui appelle des moines), vol au sommet du Pic, pardon de Liss. Récompense : *Fil-de-vent*, la dague ultime de Nev (réservée à Nev). Le Moine et le Berserker portent désormais aussi la dague. Finie (`annexe cerfvolant 5`), elle servira à l'épilogue (Varen reste avec Liss). Panorama `pano.cerfvolant`.
  - « Les larmes de l'Œil » (`larmes`, Tavor, après a4.e4) : quatre larmes dans l'ordre qu'on veut (Grotte, Épave, Mines, sanctuaire des Ruines), chacune avec son gardien et le souvenir d'un héros ; Orvan, resté à Aerie après le feu de camp, remet la classe ultime *Gardien des souvenirs*. Panorama `pano.larmes`.
- Moteur : étape « en désordre » (`parmi` dans annexes.js, morceaux dans `S.morceaux`, repères `<quête>.e<n>.m<k>`) ; étape `saute` (passée toute seule quand sa condition est vraie) ; condition `objet <id>` ; sous-titre de PNJ par village (`sous` dans monde.js).
- Techniques : Saut (le héros quitte le combat jusqu'à son tour suivant, personne ne le touche, puis il retombe sur sa cible, même en l'air), Souffle (Vent sur tous), Rappel (un allié refait sa dernière action sans payer de PP), Sceau de mémoire (un tiers de dégâts en moins pendant les 4 prochaines actions des monstres).
- Codex, onglet Personnages : Liss, et nouvelles infos pour Orvan, Varen, Nev, Tavor et Ilse.
- Images provisoires : Wyverne mère, quatre gardiens de larme, Prieur spectral (pixel art), portrait de Liss, trois panoramas en cadre nommé.
- Équilibrage au bot (graines 1 à 5 ; le bot joue ces quêtes avant le Pic, à quatre héros, niveaux 31 à 38) : gardiens de larme entre 18 et 63 % de PV au plus bas, Wyverne mère entre 0 et 67 %, Prieur spectral (Nev et Varen) entre 32 et 65 %.

## Version 0.5.1 (2026-10-23)

- Demande de Keismey : les traversées allaient trop vite. `traverse` (moteur/carte.js) avance en 4 étapes de 1,4 s ; le panneau garde la liste de ce qui s'est passé à chaque étape (combat gagné et contre qui, or ramassé, rien à signaler) ; avant chaque combat, les monstres sont annoncés avec un bouton « Combattre » ; à l'arrivée, un bilan affiché d'un coup (option `instant` de `show`, demande de Keismey) et validé d'un appui.
- Demande de Keismey : fin de combat toujours validée d'un appui (avant, le combat automatique sans niveau gagné continuait tout seul). Écran de victoire (`ecranVictoire` dans moteur/combat.js) : XP et or gagnés, barre d'XP de chaque héros qui se remplit, « Niveau N ! » quand un niveau est gagné.
- Correction : un bouton doré (principal) restait gris quand le pointeur était encore dessus après un appui.

## Version 0.5.0 (2026-10-23)

- Acte 4 « L'Œil », première partie (donnees/acte4.js, étapes a4.e1 à a4.e7, plan validé par Keismey) : carte `vents` avec le Pont des Nuées (zone à deux côtés Cendre/Aerie), Aerie, les Ruines du monastère (parvis/sanctuaire) et le Pic hurlant (base/sommet) ; l'Escalier de brume est visible en « bientôt ». L'histoire va jusqu'au feu de camp, la veille de l'assaut.
- a4.e1 pose le drapeau `acte4` ; Kael reçoit l'Épée d'Aldric (`aldric`, réservée à Kael, Attaque +36).
- Boss : Serpent d'azur (a4.e5, charge + double garde), Varen en duel contre Nev seule (a4.e6, `equipe: 'nev'`). Monstres : rapace, sylphe, gargouille, moine spectral, griffon, élémentaire de givre.
- Classes Sage, Ninja et Lame-mage (cristal d'azur, a4.e5). Techniques : prière, jugement, kunaï, ninjutsu, taille-sort (Attaque et Magie), enchantement (l'Attaque prend l'élément du héros pendant 3 actions).
- Varen invité : après a4.e6 (drapeau `varen`), il se bat avec l'équipe dans tous les combats, sauf les duels (`equipe`) et les combats avec une autre invitée. Classe Duelliste (lames croisées, parade).
- Capacité `envol` (Roc ailé) : un tour sur deux il s'envole ; en l'air seul le Vent le touche, briser sa garde le fait tomber, et il pique sur toute l'équipe en redescendant. Demande de Keismey : deux images (`monstre.rocaile` au sol, `monstre.rocaile.vol` en vol) ; en vol, le monstre monte au-dessus de sa place sans sortir de l'écran (`levee` dans moteur/scene.js), son ombre et son cadre d'infos restent au sol.
- Quêtes annexes : fin de la graine (Fleur-lanterne, accessoire qui rend des PV à chaque action), du carnet du chasseur (Roc ailé au Pont, Œil du traqueur : faiblesses connues dès le début du combat, 800 po) et du colporteur (Ilse tisse la Cape des quatre vents). Nouvelle quête 14 « Le courrier des falaises » (`courrier`, Pell) : Plume du facteur (depuis la carte, aller directement dans une zone déjà visitée, sans combat de traversée) ; à la fin, Joran vend la Plume de vent et l'Amulette des nuées.
- Aerie : auberge d'Edda, boutique de Joran (armes et armures des vents, Baume des vents +400 PV). Roxane, Fennel, Pell et Ilse y sont après a4.e2.
- Codex, onglet Personnages : Tavor, Pell, Ilse, et nouvelles infos pour Kael, Mira, Sol, Nev, Orvan, Varen, Naïa, Ysold, Roxane, Fennel.
- Images de l'acte 4 : toutes provisoires (pixel art pour les monstres, les visages et les décors, cadre nommé pour les panoramas).
- Le vérificateur signale désormais les repères de texte en double sans planter.
- Équilibrage au bot (graines 1 à 3, le bot sait maintenant viser un monstre en l'air avec le Vent) : l'équipe arrive au Pont vers le niveau 29 et au sommet du Pic vers 33 ; le Serpent d'azur descend l'équipe entre 7 et 43 % de PV, Varen (Nev seule) entre 16 et 35 %, le Roc ailé entre 36 et 74 % (le bot se soigne beaucoup avec Sol).
## Version 0.4.2 (2026-10-23)

- Demande de Keismey : les armes ultimes sont réservées à leur personnage (`heros` dans donnees/objets.js) : Bâton des marées pour Sol, Cœur de forge pour Mira. Le sac, l'inventaire et le menu Équipe l'indiquent (« Seulement pour Sol », « Réservée à Mira ») ; une arme portée par quelqu'un d'autre retourne au sac au chargement de la partie. L'épée d'Aldric (Kael) et la dague de Nev suivront la même règle à l'acte 4.

## Version 0.4.1 (2026-10-23)

- Quêtes annexes 9 et 10 de la bible, données par Hilde à Forgecendre après l'épée reforgée (`ouvre: 'fini a3.e10'`), choix validés par Keismey :
  - « Le premier moule » (`moule`) : salle scellée des Mines rouges (boss : deux Gardiens de cage), moule jeté dans le cratère du Volcan endormi, forge avec Hilde. Récompense : *Cœur de forge*, bâton ultime de Mira (Magie +29, PP +10). Panorama `pano.forge`.
  - « Le carnet d'Aldric » (`aldric`) : page dans la garde de l'épée, page chez Brann, page au fond de la Grotte de Cristal (Ombres de brume), dernière page au sommet du Col (sentinelles et automate de l'Ordre). Récompense : *Bouclier d'Aldric* (accessoire, Défense +8, PV +25) et le *Carnet d'Aldric*. Toute la quête se joue dès l'acte 3 ; finie (`annexe aldric 4`), elle fait survivre Aldric dans l'épilogue (acte 4). Panorama `pano.carnet`.
- Invitée en combat : option `invitee: 'hilde'` d'un combat de quête. Hilde (`HEROS.hilde`, `invite: true`, classe Forgeronne : Coup de marteau qui ronge la garde, Trempe qui divise les dégâts par deux) se bat au niveau de Kael, se commande comme un héros, ne gagne pas d'expérience et n'apparaît ni dans le menu Équipe ni dans le Codex. Cinq cartes en combat (`.pcards.n5`).
- Un personnage qui a deux quêtes à offrir (Hilde) propose l'autre quand on vient d'en refuser une (`offresRefusees` dans moteur/village.js).
- Codex, onglet Personnages : nouvelles infos pour Kael, Mira, Brann, Hilde et le Sans-Nom.
- Correction : le casque trouvé dans la galerie porte le nom d'Ulric (et non Bram), le père de Tobi.
- Images provisoires : Gardien de cage et Ombre de brume (pixel art) ; panoramas en cadre nommé.
- Équilibrage au bot (graines 1 à 3) : les Gardiens de cage descendent l'équipe (niveau 26, avec Hilde) entre 19 et 39 % de PV.

## Version 0.4.0 (2026-10-23)

- Acte 3 « Les forges de Cendre » (donnees/acte3.js, étapes a3.e1 à a3.e10, plan validé par Keismey) : carte `cendre` avec les Champs brûlés (zone à deux côtés vallée/Cendre), Forgecendre (état `libre` après a3.e5), les Mines rouges, le Volcan endormi ; le Pont des Nuées est visible en « bientôt ».
- Nev rejoint en a3.e1 (élément Vent `V`, classe de départ Moine) : combats à quatre héros (`.pcards.n4`). Duel de a3.e8 avec `equipe: 'kael nev'`.
- Événement `['drapeau', id]` (pose `S.f[id]`) : `acte3` en a3.e1, `pardon` (choix de Mira en a3.e6), `charrette` en a3.e10 (voyage direct vers un village depuis la carte, moteur/carte.js).
- Classes Berserker, Alchimiste, Invocateur (cristal de braise, a3.e8) et Géomancien (secrète, quête « La pierre qui chante ») ; élément `Z` = élément de la région (`ELEMENT_REGION` dans donnees/heros.js). Techniques : furie (recul), rage (Attaque ×1,4 pendant 3 actions, Défense baissée), corrosion (retire un point de garde), mixture, invocation, offrande, terroir, éboulement.
- Quêtes annexes : suite de la graine (bourgeon), du carnet (Salamandre reine, 500 po), du colporteur (Dorn, lingot → plume de roc) avec une dernière étape qui attend `drapeau acte4` ; fin de « La berceuse » (Bâton des marées pour Sol) ; nouvelles quêtes `pierre` (Dorn) et `mineurs` (Tobi, Lampe de mineur : l'exploration trouve plus souvent un trésor ou un lieu ; trois armes de Hilde débloquées).
- Hilde quitte Lanterval pour Forgecendre en a3.e2 ; Roxane et Fennel l'y suivent.
- Équilibrage au bot (graines 1 à 5) : l'équipe entre dans l'acte 3 vers le niveau 18 et le finit vers 25 ; les boss de l'acte 3 sont plus rapides et ont plus de garde, pour ne pas rester brisés en permanence face à quatre héros.
- Mode test : sauter une étape applique aussi les événements d'une traversée (`milieu`), sinon Nev ne rejoignait pas l'équipe.
- Images de l'acte 3 : toutes provisoires (entrées ajoutées dans donnees/images.js avec leur `sujet`).

## Version 0.3.5 (2026-10-23)

- Mise à jour du jeu sur le site public : le service worker télécharge les fichiers sans le cache du navigateur (`cache: 'reload'`, GitHub Pages les garde 10 minutes), et la page se recharge toute seule à l'écran titre quand une nouvelle version s'installe.

## Version 0.3.4 (2026-10-23)

- Demande de Keismey : sur grand écran (paysage d'au moins 560 px de haut), même mise en page que sur téléphone, image en haut au format des décors (16:9, jusqu'à 60 % de la hauteur) et panneau de dialogues et boutons dessous, largeur bornée (720 à 1100 px). Seul le téléphone couché garde la scène à gauche et le panneau à droite (css/jeu.css).

## Version 0.3.3 (2026-10-23)

- Demande de Keismey (ne pas casser le 4e mur) : une bulle « ? texte » est une astuce de jeu, affichée dans un encadré avec une icône « ? » (`encadreTuto` dans moteur/textes.js). Les conseils avant un boss (`conseil`) sont encadrés de la même façon. Appliqué au prologue (les « ! »), aux deux annonces de classes et aux récompenses des quêtes annexes.

## Version 0.3.2 (2026-10-23)

- Quêtes annexes de la vallée (bible, quêtes 2, 3 et 4), jouées aux actes 1 et 2 ; leur dernière étape attend l'acte 3 (`si: 'drapeau acte3'`) :
  - « La graine-lanterne » (Pia, après la fête) : arroser la graine au Marais des Lanternes (feux follets) ; elle devient une pousse.
  - « Le carnet du chasseur » (Roxane, après la fête) : Sanglier-roc au Col des Pierres (garde 7, faible au Feu), Anguille-tonnerre au cœur du Marais des Lanternes (frappe deux fois tant que sa garde tient) ; Roxane paie 150 puis 300 po.
  - « Le colporteur » (Fennel, après l'arrivée de Mira) : miel de Berthe → boussole (Fennel) → perle grise (Loïc) → corne de brume (Fennel).
- Le prompt de l'étape parlait du « carnet d'Aldric » : c'est la quête 10 de la bible (acte 3). La quête 3 est « Le carnet du chasseur ».
- Personnages qui suivent l'équipe : un même PNJ dans plusieurs villages avec des conditions `si` qui se suivent (Roxane, Fennel) ; `villageDuPnj` prend le village où il est en ce moment.
- Sous-titre du donneur : `<quête>.e<n>.sous` (ce que cherche Fennel) quand l'étape se joue ailleurs.
- Capacité `double` avec `garde: true` : seulement tant que la garde du monstre tient.
- Codex, onglet Personnages : Roxane et Fennel.
- Portraits provisoires de Pia, Roxane, Fennel ; Sanglier-roc et Anguille-tonnerre en pixel art.
- `outils/bot.js` : le bot de test qui joue la partie entière (quêtes annexes comprises) et donne les niveaux et les PV les plus bas à chaque combat de quête.

## Version 0.3.1 (2026-10-23)

- Onglet Personnages du Codex (demande de Keismey) : donnees/personnages.js donne, pour chaque personnage, une condition par info ; textes perso.<id>.<n> dans textes/xx/personnages.txt. `S.perso[id]` = infos déjà lues ; une info nouvelle met une pastille sur l'icône du Codex, l'onglet et le personnage, éteinte quand on déplie sa fiche (les infos nouvelles restent surlignées). L'icône du Codex ouvre directement l'onglet Personnages quand il y a du nouveau.
- Portrait provisoire d'Ysold (`pnj.ysold`).

## Version 0.3.0 (2026-10-22)

- Acte 2 « La ville qui oublie » (donnees/acte2.js, étapes a2.e1 à a2.e8) : Marais salant (zone à deux côtés, pont entre la vallée et la côte), Salvent, Marais des Lanternes, Épave engloutie, Phare noyé.
- Cartes par région : `region` dans donnees/monde.js, `carte: { cote: [x, y] }` pour un lieu sur deux cartes ; le menu de la carte propose aussi les villages des autres régions.
- Boss : Vouivre des marais, Mère-des-abysses (appelle des crabes), Héraut de la Paupière ; boss annexes : Pie-brume, Bosco. Nouvelles capacités de monstres : `drain`, `double`, `appel`, et `vol` (objet volable).
- Classes Moine, Voleur, Barde (cristal d'écume) et classe secrète Corsaire (quête « Le navire oublié »). Statuts de combat : sommeil, courage, esquive.
- Quêtes annexes : « Le navire oublié » (Rosal), « Les prix perdus » (Gaspard : prix tirés au hasard à chaque visite, en rouge si gonflés et en vert si réduits, puis vrais prix à −10 %), « La berceuse » (étape 1 ; l'étape 2 attend l'acte 3 via `si: 'drapeau acte3'`).
- Boutiques à onglets (Armes, Armures, Accessoires, Consommables), à l'achat comme à la vente (demande de Keismey).
- Défaite : réveil à l'auberge du dernier village visité (`S.auberge`).
- Équilibrage vérifié au bot (exploration à 100 %, niveaux 15 à 17 en fin d'acte 2) : boss de l'acte 2 entre 15 et 40 % de PV restants au plus bas, sans défaite.
- Images provisoires (pixel art) pour tout ce qui est nouveau.

## Version 0.2.2 (2026-10-22)

- Pas de quête téléguidée (demande de Keismey) : plus de bouton « Aller à / Rentrer à » ; un « ! » marque le bouton Carte (`marqueCarte`), le bouton Traverser (`marqueTraversee`) et le lieu sur la carte.

## Version 0.2.1 (2026-10-22)

- Codex : chaque classe débloquée est repliable (`<details class="cls">`).

## Version 0.2.0 (2026-10-22)

- L'acte 1 est complet (étapes 1 à 10 dans donnees/acte1.js ; les étapes 8 et 9 de la bible deviennent a1.e8 montée du col, a1.e9 sommet, a1.e10 épée du père).
- Col des Pierres : zone à deux côtés (pied, sommet), 6 découvertes, 5 événements, Bélier des roches et Harpie du col ; état « vide » après le vol du cristal.
- Duel contre Varen à deux héros (`equipe: 'kael mira'`), puis combat perdu d'avance contre le Sans-Nom (`perdu: true`, monstre `intouchable`) : pas de retour au village ni de perte d'or, l'étape continue et Kael se réveille à l'auberge.
- Épée du père (objet important), Marais salant sur la carte (prochaine version).
- Hilde, mère de Mira, tient la forge de Lanterval (armes et armures, nouvelles pièces après la fête) ; Berthe vend les herbes et toniques. Accueil des boutiques selon l'avancée (`pnj.<id>.accueil.<étape>`).
- Images provisoires (pixel art) : décor du col, Bélier, Harpie, Varen, Sans-Nom, portraits de Hilde, Varen et du Sans-Nom. Panoramas « cage du cristal » et « épée du père » en cadre nommé.
- Hub : pas de fiche avant la version finale (décision de Keismey) ; le jeu se joue par son lien.

## Version 0.1.2 (2026-10-22)

- 0.1.1 : texte stable, appui n'importe où pour continuer, monstres deux fois plus petits, icônes de combat colorées par élément. Le moteur gère les armes élémentaires (`el` dans donnees/objets.js), mais aucune n'en a pour l'instant.
- 0.1.2 : onglet Classes dans le Codex (classes débloquées, armes, statistiques, techniques) ; le Bâton de braise n'est plus de Feu et l'Attaque n'est plus colorée (seules les techniques le sont) ; jauges PV, PP et XP chiffrées dans le menu Équipe. Explication des stats (appui dans l'Équipe, aide du Codex). Journal à quêtes repliables, sans les classes. Menus à taille fixe (`modal('grand', …)`). Point de reprise `S.reprise` : une étape interrompue reprend après le dernier événement joué.

- Acte 1 jouable de l'Ancien Orvan à la fête de la lanterne (étapes 1 à 7 de la bible), quête annexe du loup alpha.
- Le Col des Pierres apparaît sur la carte, marqué « prochaine version ».
- Sauvegarde automatique, copie de secours, export/import (Options › Sauvegarde), partie+.
- FR et EN complets, hors ligne, mode test.
- Images définitives : place du village, Kael (+ portrait), loup des brumes, panorama de la fête. Le reste est provisoire (pixel art de la maquette ou cadre nommé).

## Prochaine étape

Le jeu est complet. Reste : les images définitives du final (fil des images), puis la fiche du jeu sur le hub, dans une étape à part sur le dépôt du hub, après les images.
