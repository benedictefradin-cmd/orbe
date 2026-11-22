# Hors périmètre du prompt 2

Points repérés pendant le prompt 2 (consultation) qui touchent des fichiers hors de son périmètre.
À reprendre dans le prompt indiqué.

## Pour le prompt 4 (design)

- **Lien « Méthode » dans le pied de page.** La route `/methode` existe. Le lien doit être ajouté dans `PiedDePage` (`src/components/site.tsx`), à côté de « Données personnelles ». Le libellé est prêt dans `METHODE.lienPied` (`src/lib/contenus.ts`).
- **Style des mesures indisponibles.** Le classement n'utilise plus `disabled` mais `aria-disabled="true"` (le focus n'est jamais perdu). `src/styles.css` stylait `.mesure:disabled`. Il faut ajouter la même apparence pour `.mesure[aria-disabled="true"]` et pour `.bouton-discret[aria-disabled="true"]` (Monter, Descendre).
- **Filtres par thème du classement.** Boutons `aria-pressed` avec les classes existantes `bouton bouton-contour bouton-petit`. Un état visuel « appuyé » est à prévoir.
- **Emplacement du compteur.** Le composant sans style `CompteurReponses` (`src/components/compteur.tsx`) et la donnée `etat.compteur` (`getEtatSite`) sont prêts. Le prompt 4 décide où l'afficher (accueil, consultation).

## Modifié hors périmètre, au plus juste

- `scripts/captures.mjs` (prompt 1) : ajout de la page `/methode` à la liste des pages capturées, pour que `npm run captures -- 02-methode` la contienne. Mise en forme Prettier du fichier (une erreur de lint bloquait `npm run lint`).
- `src/routeTree.gen.ts` : fichier généré, régénéré par le plugin du routeur pour les routes `/methode` et `/resultats`.
- `src/components/compteur.tsx` : nouveau composant sans style demandé par le lot C.

## Pour un prompt ultérieur

- **Dépendance de test manquante.** `@testing-library/react` est installé, mais pas sa dépendance `@testing-library/dom`. Le test du composant de classement (`src/test/classement-composant.test.tsx`) utilise donc directement React et le DOM. Ajouter `@testing-library/dom` dans `package.json` permettrait d'écrire ces tests plus simplement.
- **Règle de calendrier du cron.** Aucune purge planifiée ne vise la table `jetons_utilises` (lot D) : elle est purgée par la tâche quotidienne Vercel (`entretenirBase`) et à chaque ouverture du tableau de bord. Une tâche `pg_cron` peut être ajoutée dans une nouvelle migration si besoin.
