# Consultation citoyenne et ateliers · Présidentielle 2027

Site de l'Institut Rousseau et de Face à l'inceste. Il propose deux choses :

1. une **consultation citoyenne anonyme** : on classe 5 mesures parmi 24, puis on répond à des questions facultatives ;
2. une **inscription aux ateliers** en visio de décembre 2026.

Le tout est présenté aux candidats en février 2027.

Stack : TanStack Start (React 19, SSR), Tailwind 4, zod et Supabase (Postgres). Le site est autonome et n'est pas relié à Lovable.

## Démarrer en local

```bash
nvm use            # Node 22.12 ou plus
npm install
cp .env.example .env.local   # renseigner les valeurs, voir plus bas
npm run dev:local  # base Postgres embarquée (PGlite) dans .data/, aucune connexion Supabase
```

Le site tourne sur http://localhost:3000. Le tableau de bord est sur http://localhost:3000/admin.

Pour tester les fermetures, ajoutez `DATE_SIMULEE=2026-12-12T00:00:00+01:00` dans `.env.local`. Cette variable est ignorée en production.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role, utilisée uniquement côté serveur |
| `ADMIN_USERNAME` | Identifiant du tableau de bord |
| `ADMIN_PASSWORD` | Mot de passe du tableau de bord |
| `ADMIN_SESSION_SECRET` | Clé de signature des sessions et des jetons de formulaire (32 caractères minimum, `openssl rand -base64 48`) |
| `IP_HASH_SALT` | Sel de l'empreinte des adresses IP (16 caractères minimum, `openssl rand -base64 24`) |

Aucun secret n'est stocké dans le dépôt. Sans `ADMIN_USERNAME`, `ADMIN_PASSWORD` et `ADMIN_SESSION_SECRET`, personne ne peut accéder au tableau de bord.

## Mise en production

1. **Supabase.** Créez un projet, puis appliquez `supabase/migrations`. Avec la CLI, lancez `supabase db push`. Sans la CLI, collez `docs/schema-a-appliquer.sql` dans l'éditeur SQL. La seconde migration active `pg_cron` pour les purges nocturnes.
2. **Hébergement.** Le build Nitro détecte automatiquement Vercel, Netlify ou Cloudflare. Vous pouvez aussi forcer la cible avec `NITRO_PRESET`. Renseignez les variables ci-dessus, puis lancez `npm run build`.
3. **Domaine.** Les métadonnées de partage, les liens d'annulation et les exports utilisent le domaine courant. Aucun domaine n'est écrit en dur.
4. **Logo de Face à l'inceste.** `src/assets/img/logo-face-a-l-inceste.svg` est un emplacement provisoire. Remplacez-le par le logo officiel, sous le même nom. Relancez ensuite `npm run og-image` pour régénérer l'image de partage.
5. **Limite d'envois.** L'adresse IP vient des en-têtes posés par l'hébergeur (`cf-connecting-ip`, `x-vercel-forwarded-for`, `x-real-ip`, puis `x-forwarded-for`). Vérifiez que votre hébergeur réécrit bien ces en-têtes.

## Vérifications

```bash
npm run typecheck
npm run lint
npm test           # Vitest, dont les fonctions SQL testées sur un vrai Postgres embarqué
npm run test:e2e   # Playwright, deux parcours en 360 et 1280 px, dates simulées, accessibilité (axe)
```

`npm run test:e2e` lance trois serveurs locaux, chacun avec sa propre base :

- le premier à la date réelle ;
- le deuxième au 12 décembre 2026 à 0 h 00, inscriptions closes ;
- le troisième au 1er février 2027, consultation close.

Les captures des pages principales sont enregistrées dans `docs/captures`.

## Exploitation

### Se connecter au tableau de bord

1. Ouvrez `/admin` et saisissez l'identifiant et le mot de passe définis dans `ADMIN_USERNAME` et `ADMIN_PASSWORD`.
2. La session dure 12 heures. « Se déconnecter » la révoque immédiatement, même si le cookie a été copié.
3. Les données se rafraîchissent seules toutes les 30 secondes. Le bouton « Actualiser » force une mise à jour, et l'heure de la dernière mise à jour s'affiche sous le titre.

L'onglet **Ateliers** contient :

- les compteurs ;
- une jauge par atelier, avec le badge « Complet » ;
- le compte à rebours jusqu'à la fermeture des inscriptions ;
- la courbe des inscriptions par jour ;
- l'encadré **À prévenir**. Il liste les personnes sorties de la liste d'attente : écrivez-leur, puis cliquez sur « Prévenue » ;
- les boutons **Copier les adresses** de chaque atelier, à coller en copie cachée pour envoyer le lien de la visio. Seules les personnes inscrites sont copiées, sans les annulés ni la liste d'attente ;
- le tableau des inscrits. Vous pouvez y cocher « Lien visio envoyé » et « Présent », écrire un commentaire interne et annuler une inscription. La première personne en liste d'attente prend alors la place.

L'onglet **Consultation** contient les compteurs, la courbe par jour, le classement des 24 mesures en direct, la répartition des profils et la liste des réponses libres « Une mesure manque ».

Le site n'envoie aucun email. Le lien de visio est envoyé à la main depuis votre messagerie. Chaque inscrit a déjà dans son fichier agenda l'horaire et son lien d'annulation.

### Exporter les deux fichiers Excel

En haut du tableau de bord, il y a deux exports bien séparés :

- **Télécharger les réponses (.xlsx)**, qui produit `reponses-consultation-AAAA-MM-JJ.xlsx` ;
- **Télécharger les inscriptions (.xlsx)**, qui produit `inscriptions-ateliers-AAAA-MM-JJ.xlsx`.

Le bouton `.csv` voisin produit le même contenu en CSV (séparateur point-virgule, UTF-8). Dans tous les exports, la ligne d'en-tête est figée et chaque question a sa colonne. Les saisies qui commencent par `=`, `+`, `-` ou `@` sont neutralisées par une apostrophe.

**Avant le 31 mars 2027**, transmettez à chaque structure les consentements aux actualités. Ce sont les colonnes « Actualités Institut Rousseau le » et « Actualités Face à l'inceste le ». À cette date, toutes les inscriptions sont supprimées automatiquement.

### Changer les dates

Tout se trouve dans `src/lib/config.ts`.

- `ATELIERS` : titres, début et fin de chaque atelier, avec le décalage horaire `+01:00`. La date limite d'inscription se recalcule seule : c'est le jour situé 3 jours avant le premier atelier, inclus.
- `CAPACITE_PAR_ATELIER` : un nombre, ou `"illimité"`. Avec `"illimité"`, il n'y a pas de liste d'attente.
- `CLOTURE_CONSULTATION` : dernier jour inclus de la consultation. Elle ferme le lendemain à 0 h 00.
- `RESTITUTION_ATELIERS`, `DEBAT` et `SUPPRESSION_DES_DONNEES_ATELIERS`. Si vous changez la date de suppression, changez-la aussi dans la tâche `pg_cron` de `supabase/migrations/20261121000100_purges_planifiees.sql`.

La table `ateliers` se met à jour automatiquement à partir de ce fichier. Lancez ensuite `npm test` : les tests du calendrier indiquent ce qu'il faut ajuster.

### Mettre à jour la frise du contexte

Dans `src/lib/contenus.ts`, section `CONTEXTE` :

1. ajoutez ou modifiez une entrée de `frise` (`date` et `texte`) ;
2. mettez `miseAJour` à la date du jour, au format `AAAA-MM-JJ`. Elle s'affiche sous « Mis à jour le » ;
3. lancez `npm test`. Un test refuse les deux points et les tirets dans les textes visibles.

Les autres textes du site sont aussi dans `contenus.ts`. Les 24 mesures sont dans `src/lib/mesures.ts`. Ne changez jamais leurs identifiants (`m01` à `m24`), car ils sont stockés dans les réponses.
