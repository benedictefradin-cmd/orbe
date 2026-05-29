# ORBE IA — Règles du projet

Studio d'automatisation IA + sites / applications / plateformes sur mesure pour
indépendants et TPE. Site one-page statique (HTML/CSS/JS inline), sans CMS ni
base de données, avec une section journal/blog minimaliste.

## Règles permanentes (NE JAMAIS enfreindre)

1. **Direction artistique inchangée.** Fond crème `#f6f1e7`, accent ambre `#c8841f`,
   grain papier subtil, signature orbitale dorée (fil conducteur de scroll +
   satellite). Titres en **Schibsted Grotesk**, corps en **Outfit**. Ne pas dériver
   vers un autre univers (pas de fond sombre, pas d'autres polices).

2. **Marque « ORBE IA ».** Le « IA » est en italique doré (`<span class="ia">`).
   Présent dans la nav et le footer.

3. **N'inventer aucune donnée.** Pas de chiffres de temps gagné, pas de délai « 48h »,
   pas de statistique fictive. Les seuls repères chiffrés autorisés sont ceux déjà
   présents (« dès 1 500 € », « 30 minutes »).

4. **CTA = Calendly.** Tous les boutons d'action pointent vers
   https://calendly.com/contact-orbe-ia/30min (nouvel onglet), libellés à la première
   personne (« J'automatise mon entreprise », « Je libère mon temps », etc.).
   Le mail `contact@orbe-ia.com` n'apparaît QUE dans le bloc contact final.

5. **Périmètre, écrit une seule fois par bloc :** Automatisation IA · Sites · Applications · Plateformes.

## Structure des fichiers

- `index.html` — la page d'accueil complète (CSS + JS inline). Source unique éditable.
- `assets/` — illustrations locales : `showcase-1.png`, `workflow.jpg`, `temoignage.png`.
  (Ne PAS re-référencer d'URL CloudFront/externe : tout doit être local.)
- `journal/_template.html` — gabarit d'article minimaliste (mêmes typos, couleurs, grain
  que la home). Dupliquer en `journal/<slug>.html` et remplir les champs `{{...}}`.
- `sitemap.xml`, `robots.txt`, `CNAME`, `.nojekyll` — déploiement GitHub Pages.

## Ajouter un article au Journal

1. Dupliquer `journal/_template.html` → `journal/<slug>.html`, remplir
   `{{TITRE}}`, `{{DESCRIPTION}}`, `{{SLUG}}`, `{{DATE}}`, `{{CATEGORIE}}`, le corps.
2. Dans `index.html`, section `#journal` : remplacer un `href="#"` par
   `href="journal/<slug>.html"` et mettre à jour date / catégorie / titre.
3. Ajouter une `<url>` correspondante dans `sitemap.xml`.
4. Conserver la colonne étroite, la typo et le grain du gabarit — pas de contenu inventé.

## Home — comportement attendu

Le scroll est volontaire et travaillé : hero, manifeste épinglé (sticky), parallaxe
sur les images plein écran, reveal des titres, trajectoire orbitale dorée qui suit la
progression de scroll, accordéon FAQ, sélecteur produit du hero, sticky CTA en bas sur
mobile. Vérifier la fluidité (pas de saccade) et le responsive mobile.

## Build & déploiement

- Aucun build : le site est 100 % statique, servi tel quel.
- Tester en local : `python3 -m http.server 8000`.
- Déploiement GitHub Pages (branche `main`, racine).

## Performance & a11y

Pages légères, polices préchargées, Lighthouse 95+. Contrastes AA, navigation clavier,
`alt` sur les images, `prefers-reduced-motion` à honorer si des animations sont ajoutées.
