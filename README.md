# ORBE IA

Studio d'automatisation IA + sites / applications / plateformes sur mesure pour
indépendants et TPE. **Site one-page** statique (HTML/CSS/JS inline) avec une section
journal/blog minimaliste. Aucun CMS, aucune base de données. Hébergé sur **GitHub Pages**.

> Les règles permanentes du projet sont dans [`CLAUDE.md`](CLAUDE.md).

## Arborescence

```
.
├── index.html                 # La page d'accueil complète (CSS + JS inline)
├── assets/
│   ├── showcase-1.png         # Illustration "dashboard / dirigeant"
│   ├── workflow.jpg           # Illustration "workflow"
│   └── temoignage.png         # Illustration témoignage (fleuriste)
├── journal/
│   └── _template.html         # Gabarit d'article minimaliste (à dupliquer)
├── sitemap.xml
├── robots.txt
└── CNAME                      # Domaine personnalisé orbe-ia.com
```

Tout est écrit à la main et servi tel quel — **aucune étape de build**.

## Direction artistique

- Fond crème `#f6f1e7`, accent ambre `#c8841f`, grain papier subtil.
- Titres : **Schibsted Grotesk**. Corps : **Outfit**.
- Signature orbitale : fil conducteur doré + satellite qui suit la progression du scroll.
- Marque **ORBE IA** (le « IA » en italique doré).

## Lancer en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Vérifier : scroll fluide (hero / manifeste épinglé / parallaxe / reveal des titres),
trajectoire orbitale sans saccade, accordéon FAQ, sélecteur produit du hero, sticky CTA
en bas sur mobile, et le responsive.

## Ajouter un article au Journal

1. Dupliquer `journal/_template.html` → `journal/<slug>.html` et remplir les champs
   `{{TITRE}}`, `{{DESCRIPTION}}`, `{{SLUG}}`, `{{DATE}}`, `{{CATEGORIE}}`, le corps.
2. Dans `index.html`, section `#journal`, remplacer un lien `href="#"` par
   `href="journal/<slug>.html"` et mettre à jour date / catégorie / titre.
3. Ajouter une `<url>` correspondante dans `sitemap.xml`.

Le gabarit reprend la même typo, les mêmes couleurs et le même grain que la home
(colonne étroite, retour discret vers le journal, CTA Calendly en pied).

## Mise en ligne (GitHub Pages)

1. *Settings → Pages → Source : `Deploy from a branch` → branche `main`, dossier `/ (root)`*.
2. *Custom domain* : `orbe-ia.com` (déjà dans [`CNAME`](CNAME)).
3. DNS chez le registrar :

   | Type  | Nom   | Valeur                          |
   |-------|-------|---------------------------------|
   | A     | @     | 185.199.108.153                 |
   | A     | @     | 185.199.109.153                 |
   | A     | @     | 185.199.110.153                 |
   | A     | @     | 185.199.111.153                 |
   | CNAME | www   | benedictefradin-cmd.github.io.  |

4. Une fois le DNS propagé, cocher **Enforce HTTPS**.

Le fichier `.nojekyll` désactive le traitement Jekyll de GitHub Pages (sert les fichiers tels quels).

## Contact

contact@orbe-ia.com · RDV : https://calendly.com/contact-orbe-ia/30min
