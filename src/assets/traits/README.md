# Traits corail

Seul ornement du site : un geste au feutre corail, posé sur le papier. Trois fichiers.

| Fichier | Usage |
|---|---|
| `souligner.svg` | Le mot « ensemble » du titre d'accueil, la date de clôture |
| `entourer.svg` | Le rang d'une mesure choisie, l'étape en cours de la frise |
| `fleche.svg` | L'entrée de la consultation sur l'accueil (ordinateur seulement) |

Ils sont insérés en ligne dans la page par le composant `Trait` (`src/components/ui/trait.tsx`). La couleur vient du CSS (`--corail-trait`), jamais du fichier.

## Remplacer par des traits scannés à la main

1. Tracer le geste au feutre sur du papier blanc, d'un seul mouvement. Prévoir large : le tracé sera étiré.
2. Scanner en 600 dpi, en niveaux de gris.
3. Vectoriser (Inkscape, menu Chemin puis Vectoriser un objet matriciel, un seul passage, seuil de luminosité). Garder **une forme pleine**, pas un contour : l'épaisseur qui varie fait le geste.
4. Fusionner en un seul `<path>` (Chemin puis Combiner), simplifier une fois (Ctrl+L), recadrer le document sur le tracé.
5. Dans le fichier enregistré (SVG simple) :
   - garder le `viewBox`, retirer `width` et `height` ;
   - remplacer toute couleur par `fill="currentColor"` sur la balise `<svg>` ;
   - garder `preserveAspectRatio="none"` pour `souligner.svg` et `entourer.svg` (ils s'étirent sur le mot ou le chiffre), le retirer pour `fleche.svg` ;
   - ajouter `pathLength="1"` sur le `<path>` (utilisé pour l'animation du tracé) ;
   - ajouter `aria-hidden="true"`.
6. Passer le fichier dans SVGO (`npx svgo fichier.svg`) en vérifiant que `pathLength` et `viewBox` restent.
7. Remplacer le fichier du même nom ici. Aucun autre changement n'est nécessaire.

Règles : jamais de dégradé, jamais de contour uniforme (`stroke`), jamais de texte. Le corail ne sert qu'à ce trait.
