# Hors périmètre, relevé pendant le prompt 3 (textes)

Le prompt 3 ne modifie que `src/lib/contenus.ts`, les libellés de `src/lib/formulaires.ts` et `src/test/contenus.test.ts`. Aucune clé n'a été renommée, supprimée ni retypée. Voici ce qui reste à faire ailleurs.

## Affichage (prompt 4)

- **`ACCUEIL.accroche`** (« Votre avis compte. ») : la clé est gardée, son affichage est à retirer dans `src/routes/index.tsx`. C'est la dernière occurrence de cette phrase sur le site.
- **`CONSULTATION.fin.confirmation`** (nouvelle clé) : « Elle rejoint la synthèse remise aux candidates et candidats en février 2027. » À afficher juste sous le titre de l'écran de fin (`CONSULTATION.merci`, dans `Merci()` de `src/routes/consultation.tsx`).
- **`CONSULTATION.rebondTexte`** (nouvelle clé) : « 1h30 en visio et en petit groupe. Aucune expertise requise. » À afficher sous `rebondTitre`. Le prompt proposait « 1h30 en visio, en petit groupe ». La virgule a été remplacée par « et » (règle AGENTS.md sur les phrases coupées par une virgule).
- **Rebond de l'écran de fin** : `src/routes/consultation.tsx` écrit en dur « Inscriptions jusqu'au … inclus » et la liste des deux ateliers. Avec `rebondTexte`, la liste peut être allégée.
- **Compteur** : le prompt demande « Plus de N personnes ont déjà répondu. » avec un point final. `src/test/redevabilite.test.ts:19` attend la phrase sans point. `COMPTEUR.texte` reste donc sans point. Ajouter le point et mettre à jour ce test ensemble.
- **Chiffre « 1 personne sur 10 »** : `CHIFFRES[2].valeur` vaut maintenant « 1 personne sur 10 » (texte : « en France déclare avoir subi… »). Dans `src/components/contexte.tsx`, `Visuel` reconnaît seulement une unité de la forme `^sur (\d+)$`. Les dix points ne s'affichent donc plus. Correction en une ligne : remplacer la regex par `/sur (\d+)$/`.
- **Description de `/methode`** : la route n'a pas de clé `META` dédiée. `META` couvre accueil, contexte, consultation, ateliers et données personnelles.

## Sélecteurs e2e à mettre à jour (prompt 6)

| Fichier | Ancien texte | Nouveau texte |
|---|---|---|
| `e2e/aides.ts:84` | « Vos 5 mesures sont choisies. » | « Vos 5 priorités sont prêtes. » |
| `e2e/aides.ts:104`, `e2e/parcours.spec.ts:212` | « Je valide mes réponses » | « J'envoie mes réponses » |
| `e2e/aides.ts:106` | « Merci. Vos réponses sont bien enregistrées. » | « Merci. Votre voix est enregistrée. » |
| `e2e/parcours.spec.ts:18` | « Les avancées d'hier et les enjeux de demain » | « Où en est la loi » |
| `e2e/parcours.spec.ts:19`, `:131`, `:308` | « Je veux participer à la consultation citoyenne » | « Je choisis mes 5 priorités » |
| `e2e/parcours.spec.ts:20`, `:254` | « Je veux participer aux ateliers » | « Je rejoins un atelier » |
| `e2e/parcours.spec.ts:59` | « Allez plus loin : rejoignez un atelier de réflexion en décembre » | « Envie d'aller plus loin ? Rejoignez un atelier en décembre. » |
| `e2e/parcours.spec.ts:62` | « Je découvre les ateliers » | « Je choisis mon atelier » |
| `e2e/parcours.spec.ts:66` | « Faites circuler » | « Invitez une personne de plus » |
| `e2e/parcours.spec.ts:251` | « Je réponds à la consultation » (attendu absent) | « Je choisis mes 5 priorités ». Le test passe aujourd'hui sans rien vérifier. |

`e2e/aides.ts:80` (« Cette consultation est anonyme. ») reste valide.

## Textes écrits en dur hors de `contenus.ts`

- `src/routes/consultation.tsx` : « Étape N sur 4 (…) », « Inscriptions jusqu'au … inclus », « Atelier 1 : … ». À déplacer dans `contenus.ts`.
- `src/components/site.tsx` : le partage natif utilise `ACCUEIL.titre` comme titre. Il vaut maintenant « Construisons ensemble ce qui protègera nos enfants demain. » Une clé `PARTAGE.titreNatif` serait plus juste.
