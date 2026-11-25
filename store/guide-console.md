# Lanterval · mise en ligne sur Google Play, pas à pas

Pour la 1.0 en test fermé. Les réponses à recopier sont dans `console.md`, les textes dans `fr.md` et `en.md`, les images dans `graphismes/`. Compte développeur déjà prêt (comme pour Oxyblox et Pico-Clinic).

Durée totale : environ 1 h la première fois, puis l'examen de Google (de quelques heures à quelques jours).

## Étape 1 · Créer la clé de signature (une seule fois, 5 min)

1. Sur GitHub, ouvre le dépôt **Lanterval** › **Settings** › **Secrets and variables** › **Actions**.
2. **New repository secret** : nom `KEYSTORE_PASSWORD`, valeur : un mot de passe solide (garde-le dans ton gestionnaire de mots de passe, tu ne pourras plus le relire sur GitHub).
3. Onglet **Actions** › à gauche **Créer la clé Android (une seule fois)** › **Run workflow** › **Run workflow**.
4. Quand la ligne passe au vert (1 min), clique dessus › en bas, **Artifacts** › télécharge **cle-android** (un zip, gardé 1 jour seulement).
5. Dans le zip :
   - `upload.jks` : la clé. Range-la **hors de GitHub**, en deux exemplaires (ton PC + un cloud ou une clé USB). Sans elle, plus de mise à jour possible sans passer par le support Google.
   - `KEYSTORE_BASE64.txt` : ouvre-le, copie tout le texte.
6. Retour dans **Settings › Secrets › Actions** › **New repository secret** : nom `KEYSTORE_BASE64`, valeur : le texte copié.

## Étape 2 · Fabriquer l'appli (10 min d'attente)

1. **Actions** › **Appli Android** › **Run workflow**. Dans « Numéro de version », tape `1.0.0` › **Run workflow**.
2. Quand c'est vert, ouvre la ligne › **Artifacts** › télécharge **Lanterval-1.0.0**. Dedans :
   - `Lanterval-1.0.0.aab` : le fichier pour la Play Console ;
   - `Lanterval-1.0.0.apk` : à installer sur ton téléphone pour un dernier essai si tu veux (Android demandera d'autoriser l'installation depuis cette source).
3. Si tu n'as qu'un fichier `-test.apk`, c'est que les secrets de l'étape 1 manquent.

Pour chaque mise à jour plus tard : même chose avec un numéro plus grand (1.0.1, 1.1.0…). Le numéro interne (versionCode) monte tout seul.

## Étape 3 · Créer l'application dans la Play Console (5 min)

1. https://play.google.com/console › **Toutes les applis** › **Créer une application**.
2. Remplis avec `console.md` › « Créer l'application » : nom **Lanterval**, langue **Français – fr-FR**, **Jeu**, **Gratuite**.
3. Coche les deux déclarations (règles du programme, lois d'export) › **Créer l'application**.

## Étape 4 · Configurer l'application (30 min)

Sur le **Tableau de bord**, section « Configurer votre application », ouvre chaque tâche une par une. Toutes les réponses sont dans `console.md` › « Contenu de l'application ».

1. **Règles de confidentialité** : `https://keismey.github.io/confidentialite-lanterval.html`.
2. **Accès à l'application** : toutes les fonctionnalités sont disponibles sans restriction.
3. **Annonces** : Non.
4. **Classification du contenu** : e-mail du studio, catégorie **Jeu**, puis le questionnaire (tableau « Classification » de `console.md`). **Enregistrer** › **Envoyer**.
5. **Public cible et contenu** : 13-15, 16-17, 18 et plus. Attrait pour les enfants : Non.
6. **Applications d'actualités** : Non.
7. **Sécurité des données** : « Votre application collecte-t-elle ou partage-t-elle des types de données requis ? » **Non** › suivant › **Envoyer**.
8. **Applications gouvernementales**, **Fonctionnalités financières**, **Santé** : Non / aucune.
9. **Catégorie de l'application et coordonnées** : **Jeu de rôle**, e-mail du studio, site `https://keismey.github.io/`.
10. **Fiche Play Store principale** (menu de gauche : Croissance › Présence sur le Store › Fiche principale) :
    - Nom, description courte, description complète : copie depuis `fr.md` ;
    - Icône : `graphismes/icone-512.png` ;
    - Image de présentation : `graphismes/presentation-1024x500.png` ;
    - Captures de téléphone : les 7 images de `graphismes/captures-fr/`, dans l'ordre ;
    - Vidéo : vide (ou le lien YouTube de la bande-annonce si tu la mets en ligne) ;
    - **Enregistrer**.
11. **Traduction anglaise** : en haut de la fiche, **Gérer les traductions** › **Ajouter vos propres traductions** › **anglais (États-Unis) – en-US** › copie `en.md`, et les captures de `graphismes/captures-en/` (l'icône et l'image de présentation peuvent rester les mêmes). **Enregistrer**.

## Étape 5 · Lancer le test fermé (10 min)

1. Menu de gauche › **Tester et publier** › **Tests** › **Test fermé** › piste **Alpha** (ou « Closed testing ») › **Gérer la piste**.
2. Onglet **Pays/régions** › **Ajouter des pays/régions** › sélectionne tout (ou au moins France, Belgique, Suisse, Canada, Royaume-Uni, États-Unis) › **Enregistrer**.
3. Onglet **Testeurs** › crée ou réutilise ta **liste d'e-mails** de testeurs (celle d'Oxyblox peut resservir) › **Enregistrer**. Copie le **lien pour rejoindre le test sur le Web** : c'est lui que tu enverras aux testeurs.
4. **Créer une release** :
   - « Signature d'application Play » : accepte (Google garde la clé finale ; ta `upload.jks` sert seulement à envoyer les mises à jour) ;
   - **Importer** › `Lanterval-1.0.0.aab` ;
   - Nom de la release : `1.0.0` (proposé tout seul) ;
   - Notes de version : colle le bloc FR de `fr.md` entre `<fr-FR>` et `</fr-FR>`, et celui de `en.md` entre `<en-US>` et `</en-US>` (la Console prépare ces balises) ;
   - **Suivant** › lis les avertissements (un avertissement sur les symboles de débogage est normal et sans conséquence) › **Enregistrer et publier** (ou **Lancer le déploiement en test fermé**).
5. **Vue d'ensemble de la publication** (menu de gauche) › **Envoyer les modifications pour examen**.

## Étape 6 · Après l'envoi

- L'examen de Google prend en général de quelques heures à 3 jours. Tu reçois un e-mail.
- Une fois accepté, les testeurs ouvrent le lien de l'étape 5.3, acceptent, puis installent depuis le Play Store.
- **Règle des 12 testeurs** (comptes personnels) : comme pour Oxyblox, il faut au moins 12 testeurs inscrits au test fermé pendant **14 jours d'affilée** avant de pouvoir demander l'accès à la production. Le compteur démarre quand la release est en ligne et que les testeurs ont rejoint : envoie le lien dès que possible.
- Au bout des 14 jours : Tableau de bord › **Demander l'accès à la production** (questionnaire sur le test : combien de testeurs, quels retours, ce qui a changé), puis une release en **Production**.

## Si quelque chose bloque

- Le workflow est rouge : ouvre la ligne, l'étape en rouge montre l'erreur ; envoie-moi une capture.
- La Console refuse l'AAB parce que le numéro de version existe déjà : relance « Appli Android » (le numéro interne monte à chaque lancement).
- « Votre appli cible une version d'API trop ancienne » : préviens-moi, il suffit de monter la version de Capacitor dans le workflow.
