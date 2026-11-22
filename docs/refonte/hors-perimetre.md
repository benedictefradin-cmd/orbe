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
