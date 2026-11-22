# Hors périmètre, relevé pendant le prompt 1

Changements qui paraissent nécessaires mais sortent du périmètre du prompt 1. Rien n'a été modifié ici.

## À traiter vite

- **En têtes de sécurité sur Vercel.** Le build passe par Nitro, qui produit `.vercel/output/config.json` (Build Output API). Un build local (`NITRO_PRESET=vercel npx vite build`) montre que les en têtes de `vercel.json` n'y figurent pas. Vercel risque donc de les ignorer. À vérifier sur un déploiement de prévisualisation (`curl -I`). S'ils manquent, les déclarer aussi dans `vite.config.ts`, Nitro les copie alors dans `config.json` :

  ```ts
  nitro({
    vercel: { config: { version: 3, crons: [{ path: "/api/maintien", schedule: "0 5 * * *" }] } },
    routeRules: {
      "/**": {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
          "X-Frame-Options": "DENY",
          "Content-Security-Policy-Report-Only": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        },
      },
    },
  }),
  ```

- **e2e et texte `anonymat`.** Le travail en cours non commité change `CONSULTATION.anonymat` en « … ni nom ni email pour répondre. Une seule réponse par personne. ». `e2e/aides.ts:63` attend encore l'ancienne phrase, ce qui fait échouer 5 tests e2e. À mettre à jour avec ce travail.

## Composants (prompt 4)

- **Anneaux de focus.** `:focus-visible` utilise maintenant `box-shadow: var(--focus)`. `.saisie:focus-visible`, `.choix:has(input:focus-visible)` et `.entree:has(...)` gardent leur `outline` de 3px. Sur `.saisie`, l'outline recouvre presque tout l'anneau, ce qui donne un léger surépaississement. À unifier sur `--focus` pendant la migration. `.entree-lien:focus-visible` a reçu `box-shadow: none` pour éviter un second anneau dans la carte.
- **`--gouttiere` local.** `.frise-item` redéfinit `--gouttiere: 36px` dans `styles.css`, ce qui masque le jeton racine dans son sous arbre. À renommer ou supprimer pendant la migration.
- **Couches CSS.** Les classes maison sont maintenant dans `@layer components`. Les utilitaires du JSX s'appliquent donc : `pt-10` sur `/consultation` et `/ateliers`, `pb-12` et `py-12` sur `/contexte`. Le haut de ces pages est plus serré qu'avant. C'est l'effet voulu du JSX, à confirmer visuellement.

## Mouvement (prompt 5)

- **Compteurs des chiffres clés** (`src/components/contexte.tsx`). Tant que la liste n'est pas apparue à l'écran, les compteurs affichent 0 (« 0 enfants victimes »). Une impression faite sans défiler montre donc 0. Le CSS remonte l'opacité d'attente à 0,5, mais la valeur affichée vient du script. Il faut afficher la vraie valeur dès le rendu, ou retirer l'effet de compteur.
- **Opacité de départ de `revelation`.** Le prompt demandait 0,4, et le contrôle exige zéro élément sous 0,5 avant défilement. Les deux ne tiennent pas ensemble avec un remplissage `both`, donc la keyframe part de 0,5.

## Divers

- **Imports dans les routes.** Pour lire `META`, `STRUCTURES` et `urlAbsolue` dans les blocs `head()`, une ligne d'import a été modifiée en tête de chaque fichier de route.
- **Adresse canonique.** Elle suit l'origine de la requête, comme `og:url`. Sur une prévisualisation Vercel, elle pointe vers le domaine de prévisualisation. Pour la forcer sur `https://orbe-ia.com`, ajouter une constante `URL_SITE` dans `config.ts` et l'utiliser dans `partage.ts`.
- **Test des descriptions.** Ajouter dans `src/test/contenus.test.ts` une vérification de longueur de `META` (150 à 160 caractères).
- **Node.** Le projet exige Node 22 (`.nvmrc`), alors que le shell par défaut de cette machine lance Node 20. `vite dev` ne démarre pas sous Node 20.

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

# Hors périmètre du prompt 4 (design)

## Textes écrits en dur, à déplacer dans `contenus.ts`

Le prompt 4 ne modifie pas `contenus.ts`. Deux libellés d'accordéon mobile sont donc des constantes locales :

- `VOIR_HISTORIQUE` (« Voir tout l'historique ») dans `src/components/contexte.tsx`.
- `LIRE_LA_SUITE` (« Lire la suite ») dans `src/routes/contexte.tsx`.

## Pour le prompt 5 (mouvement)

- **Variable `--accent`.** Seul reste de l'ancienne palette, gardée dans `:root` parce que la section mouvement l'utilise (soulignement de navigation au survol). À remplacer par `--bleu` puis supprimer.
- **Sélecteurs morts dans la section mouvement.** `.entree`, `.souligne`, `.cloture`, `.cloture-compte`, `.chiffres-liste[data-etat]`, `.chiffre-jauge`, `.chiffre-points`, `.frise-repere`, `.frise-point`, `.mise-a-jour` n'existent plus dans le balisage. Les retirer.
- **Révélation au défilement.** Sur `/contexte`, les titres de section et la frise partent d'une opacité de 0,5. Une capture pleine page prise sans défiler les montre grisés.
- **Traits corail.** Les trois SVG (`src/assets/traits/`) sont insérés en ligne par `Trait` et `Marque` (`src/components/ui/trait.tsx`), chaque `<path>` porte `pathLength="1"`. Ce sont des formes pleines : pour un tracé progressif, animer un masque ou un `clip-path`, pas `stroke-dashoffset` seul.
- **Accordéons Radix.** `AccordionContent` garde `animate-accordion-up` et `animate-accordion-down` de tw-animate-css.

## Mesures (captures `04-design`)

- **Étape priorités à 390 px.** Le contenu fait environ 5,3 écrans (7,6 avant), loin de la cible de 3,5. Les 24 cartes, à 132 px en moyenne (189 avant), font à elles seules 4 écrans. La cible de 110 px demanderait de raccourcir les mesures, de passer le texte sous 16 px ou de retirer l'axe et les sources de la carte. Aucune de ces options n'a été retenue.
