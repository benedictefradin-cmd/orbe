# Règles du projet

Site autonome (TanStack Start, Supabase), non relié à Lovable.

## Architecture
- Toutes les valeurs à faire évoluer sont dans `src/lib/config.ts` (dates, capacité, contact) et tous les textes visibles dans `src/lib/contenus.ts` (les 24 mesures dans `src/lib/mesures.ts`, les questions dans `src/lib/formulaires.ts`).
- Règles de calendrier calculées en heure de Paris dans `config.ts`, appliquées côté serveur (`src/lib/server/services.server.ts`) et affichées côté site. `DATE_SIMULEE` permet de les tester, hors production uniquement.
- Base de données : uniquement via des fonctions SQL (`supabase/migrations`), appelées avec la clé service_role. Aucune table ni fonction accessible aux rôles anon et authenticated.
- Capacité et liste d'attente sous verrou dans `inscrire_atelier`. Annuler ne supprime jamais, passe le statut à `annule` et fait monter la liste d'attente.
- Consultation anonyme : ni IP, ni email, ni heure, seulement le jour. L'empreinte salée de l'IP vit dans `limites_envoi`, jamais reliée aux réponses, purgée après 24 h.
- Jamais de succès simulé, jamais de stockage de données dans le navigateur, aucun email automatique.
- Admin : identifiant et mot de passe en variables d'environnement, cookie signé de 12 h, session révocable en base. Aucun accès de démonstration.
- Exports : passer par `src/lib/csv.ts` (`neutraliser`) pour toute cellule issue d'une saisie.

## Écriture
- Phrases courtes, vouvoiement, jamais culpabilisant, formulations épicènes.
- Aucun tiret dans les textes visibles. Deux points seulement à la française, avec une espace avant (vérifié par `src/test/contenus.test.ts`).
- Pas de petites phrases coupées par une virgule. Préférer deux phrases, ou une précision entre parenthèses (« Anonyme (environ 7 minutes) », « Atelier 1 : Repérer et protéger (lundi 14 décembre de 16h30 à 18h) »).
- Heures sans espace, « 16h30 », « 18h ».

## Vérifications
`npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` doivent passer avant chaque commit.
