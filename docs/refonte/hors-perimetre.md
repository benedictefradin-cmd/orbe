# Hors périmètre du prompt 2

Points repérés pendant le prompt 2 (consultation) qui touchent des fichiers hors de son périmètre.
À reprendre dans le prompt indiqué.

## Pour le prompt 4 (design)

- **Lien « Méthode » dans le pied de page.** La route `/methode` existe. Le lien doit être ajouté dans `PiedDePage` (`src/components/site.tsx`), à côté de « Données personnelles ». Le libellé est prêt dans `METHODE.lienPied` (`src/lib/contenus.ts`).
- **Style des mesures indisponibles.** Le classement n'utilise plus `disabled` mais `aria-disabled="true"` (le focus n'est jamais perdu). `src/styles.css` stylait `.mesure:disabled`. Il faut ajouter la même apparence pour `.mesure[aria-disabled="true"]` et pour `.bouton-discret[aria-disabled="true"]` (Monter, Descendre).
- **Filtres par thème du classement.** Boutons `aria-pressed` avec les classes existantes `bouton bouton-contour bouton-petit`. Un état visuel « appuyé » est à prévoir.
- **Emplacement du compteur.** Le composant sans style `CompteurReponses` (`src/components/compteur.tsx`) et la donnée `etat.compteur` (`getEtatSite`) sont prêts. Le prompt 4 décide où l'afficher (accueil, consultation).
