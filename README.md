# ORBE IA

Studio sur mesure — agents IA, automatisation, sites, applications, plateformes.
Site vitrine **bilingue (FR/EN)** + **Journal SEO**, 100 % statique (aucun CMS, aucune base
de données). Hébergé sur **GitHub Pages**.

> Les règles permanentes du projet sont dans [`CLAUDE.md`](CLAUDE.md).

## Arborescence

```
.
├── index.html                 # Home FR  (/)        — zéro scroll, 100dvh
├── en/index.html              # Home EN  (/en/)     — zéro scroll, 100dvh
├── assets/journal.css         # Styles du Journal (mêmes tokens que la home)
├── build.mjs                  # Générateur statique du Journal (zéro dépendance)
├── journal/
│   ├── *.md                   # Articles FR (source)
│   ├── index.html             # Liste FR        (généré)
│   └── <slug>.html            # Articles FR     (généré)
├── en/journal/
│   ├── *.md                   # Articles EN (source)
│   ├── index.html             # Liste EN        (généré)
│   └── <slug>.html            # Articles EN     (généré)
├── sitemap.xml                # (généré)
├── robots.txt                 # (généré)
├── og-image.png / .svg        # Image de partage
└── CNAME                       # Domaine personnalisé orbe-ia.com
```

Les fichiers `index.html` et `en/index.html` sont écrits à la main. Tout ce qui est sous
`journal/` et `en/journal/` (hors `.md`), ainsi que `sitemap.xml` et `robots.txt`, est
**généré par `build.mjs`** — ne pas l'éditer à la main.

## Pourquoi un script Node maison plutôt qu'un SSG ?

Le Journal est généré par `build.mjs` : un script Node **sans aucune dépendance npm**
(parseur Markdown maison + templates en chaînes). Choix volontaire :

- **Zéro `node_modules`, zéro `npm install`** — le dépôt reste léger et reproductible.
- **Sortie 100 % HTML/CSS/JS statique**, déployable tel quel sur GitHub Pages.
- Astro / Eleventy auraient apporté une chaîne d'outils et des dépendances inutiles pour
  un journal de quelques articles. Si le volume explose, la migration reste simple : les
  `.md` et le front-matter suivent une convention standard.

## Construire le Journal

Prérequis : Node 18+ (utilise uniquement la lib standard).

```bash
node build.mjs
```

Cela régénère : les deux listes (`journal/index.html`, `en/journal/index.html`), toutes les
pages d'article, `sitemap.xml` et `robots.txt`.

## Ajouter un article

1. Créer **les deux** versions (FR et EN obligatoires) :
   - `journal/<slug-fr>.md`
   - `en/journal/<slug-en>.md`
2. Front-matter requis dans chaque fichier :

   ```yaml
   ---
   title: Titre de l'article
   description: Méta-description unique (≤ ~160 caractères)
   date: 2026-05-26          # ISO, sert au tri et au <lastmod>
   lang: fr                  # fr | en
   slug: mon-slug            # = nom du fichier .md, sans extension
   translationKey: ma-cle    # IDENTIQUE entre FR et EN (assure le pairing hreflang)
   readingTime: 6            # minutes (optionnel : calculé sinon)
   ---
   ```
3. Lancer `node build.mjs`.

Chaque page générée embarque : `<title>` + meta description uniques, Open Graph, JSON-LD
(`Article` + `BreadcrumbList`), `canonical`, et `hreflang` FR↔EN appariés par `translationKey`.

## Bilingue & SEO

- FR à la racine (`/`, `/journal/`), EN sous `/en/`. Pas de redirection auto : on sert la
  page demandée. Le sélecteur FR/EN pointe vers l'URL équivalente et mémorise le choix en
  `localStorage` (`orbe-lang`).
- Balises `hreflang` (fr / en / x-default) sur chaque page, `canonical` par page,
  `sitemap.xml` avec alternances `xhtml:link`.

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
