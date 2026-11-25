# Rapport de contrôle final (prompt 6)

Contrôle du 23 novembre 2026 sur `main` (lots 1 à 5 fusionnés). Les captures sont en local, hors git (`captures/00-avant` et `captures/06-final`).

## Ce qui a été corrigé pendant le contrôle

- **Lot 5 fusionné** (`refonte/prompt-5-motion-v2`, sans conflit) et correction en attente du lot 2 commitée (réponses identiques comparées hors ordre d'affichage).
- **Tests e2e qui ne démarraient plus.** Vite surveillait les worktrees de `.claude/` et rechargeait tout à chaque écriture d'une autre session. Les trois serveurs partageaient en plus le même dossier Nitro. Corrigé dans `vite.config.ts` et `playwright.config.ts`. ESLint ignore aussi `.claude/` et `.data/`.
- **En têtes de sécurité absents en production.** La sortie Nitro ignorait ceux de `vercel.json`. Ils sont maintenant écrits dans `.vercel/output/config.json` (avec `continue: true`), vérifiés sur un build local.
- **`/methode`** : adresse canonique ajoutée, page ajoutée au sitemap.

## Grille

| Contrôle | État |
|---|---|
| `typecheck`, `lint`, `npm test` (1 964 tests, dont l'écriture) | OK |
| Aucun « Votre avis compte » affiché, ni « changer les choses », ni « candidats » seul | OK |
| Aucun chiffre sans source | OK, sauf le « 77 % » dont la source exacte reste à fournir (T1) |
| Parcours v2 complet, réponse v1 lisible, ordre gardé au retour | OK (e2e) |
| Sans accord, « personne concernée » non enregistrée | OK (e2e et serveur) |
| Moins de 15 ans : rien d'enregistré, 119 affiché | OK (e2e) |
| Compteur muet sous le seuil, message de partage sans « j'ai répondu » | OK (tests unitaires) |
| Clavier seul jusqu'au classement | OK (e2e) |
| `/contexte` à 390 px en 6 écrans au plus | OK (5,6) |
| Étape priorités en 3,5 écrans, carte de 110 px | **Non tenu** (5,3 écrans, 132 px). Arbitrage à faire, voir le prompt 4 |
| Aucun débordement de 320 à 1920 px | OK (e2e) |
| Textes de 14 px au moins, 2 familles de police | OK |
| Aucun dégradé, aucune ombre hors focus | OK |
| Aucune animation infinie ni au delà de 5 s | OK |
| Mouvement réduit : aucune animation, tout visible | OK (6 pages) |
| 0 élément sous opacité 0,5 avant défilement, impression complète | OK (30 combinaisons) |
| axe-core sur les pages principales, desktop et mobile | OK (e2e) |
| Cibles tactiles de 44 px | OK (e2e) |
| Zéro requête tierce, zéro cookie hors administration | OK en local |
| Sitemap, robots, favicon, canonical, descriptions uniques, JSON-LD | OK |
| En têtes de sécurité en ligne | OK (vérifiés sur orbe-ia.com le 25 novembre) |
| Requêtes (12 à 18 par page), LCP textuel (titre ou paragraphe, 0,4 à 1,3 s) | OK en ligne |
| Poids de 250 Ko au plus | **Non tenu** : 287 à 319 Ko. Le socle React pèse 101 Ko et les deux polices 91 Ko. Retirer ou alléger une police est un choix de design |
| CLS de 0,05 au plus | Presque : 0,052 sur `/consultation` et 0,055 sur `/methode` en mobile, 0,028 au plus ailleurs |

## Captures avant et après (390 et 1440)

| Page | Avant | Après |
|---|---|---|
| Accueil 390 | `captures/00-avant/accueil-390-fold.png` | `captures/06-final/accueil-390-fold.png` |
| Accueil 1440 | `captures/00-avant/accueil-1440-fold.png` | `captures/06-final/accueil-1440-fold.png` |
| Contexte 390 | `captures/00-avant/contexte-390-complet.png` | `captures/06-final/contexte-390-complet.png` |
| Contexte 1440 | `captures/00-avant/contexte-1440-complet.png` | `captures/06-final/contexte-1440-complet.png` |
| Consultation 390 | `captures/00-avant/consultation-390-complet.png` | `captures/06-final/consultation-390-complet.png` |
| Consultation 1440 | `captures/00-avant/consultation-1440-complet.png` | `captures/06-final/consultation-1440-complet.png` |

L'étape priorités demande une interaction : elle n'est pas dans les captures automatiques.

## Ce qui attend une validation humaine

1. **Avant tout déploiement : appliquer les migrations Supabase** (`docs/schema-a-appliquer.sql`, voir la fin de `a-valider.md`). Sans elles, l'envoi de la consultation échoue en ligne.
2. Sources : intitulé de la commission AN, document de Face à l'inceste, nature des numéros (A1), source du « 77 % » (T1).
3. Libellés « personne concernée » et case d'accord, à faire valider par Face à l'inceste (B1). Sort des réponses v1 (B2). Vérification juridique des 15 à 17 ans (B3).
4. Textes provisoires : `/methode`, écran de fin, page données personnelles (C1, C2). Dates à fixer : `DATE_RESULTATS`, `SUPPRESSION_DES_REPONSES`.
5. Réglages : quota de 30 envois par heure, version retenue pour les réponses identiques, masquage sous 10 (D).
6. Design : étape priorités en mobile (options a, b ou c du prompt 4), sceau autour de « Merci » (prompt 5).
7. CSP en mode « Report-Only » : à passer en mode bloquant après quelques jours sans rapport d'erreur.
8. Détail connu : sur l'accueil, l'échéance se lit « 11 décembre . » avec un lecteur d'écran (espace avant le point). Sans gêne réelle, à reprendre avec les réglages du trait.
