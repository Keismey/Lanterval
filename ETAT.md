# État du projet

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

## Prochaine étape (0.3)

Acte 2, la Côte de Salvent : Marais salant, Salvent, Marais des Lanternes, Épave engloutie, Phare noyé (onglet « Quête principale » de la bible).
