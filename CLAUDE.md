# ORBE IA — Règles du projet

Studio sur mesure : agents IA, automatisation, sites, applications, plateformes.
Site vitrine bilingue (FR/EN) + Journal SEO. Statique, sans CMS ni base de données.

## Règles permanentes (NE JAMAIS enfreindre)

1. **Bilingue obligatoire.** Toute page, tout contenu et tout article DOIVENT exister
   en français ET en anglais. L'anglais doit être de qualité native (pas de traduction
   littérale). FR = racine (`/`, `/journal/`), EN = préfixe (`/en/`, `/en/journal/`).

2. **Home = zéro scroll.** `index.html` (FR et EN) doit tenir entièrement dans `100dvh`
   (jamais `100vh`) sur desktop, tablette, mobile portrait ET mobile paysage. Tester
   1440×900, 390×844, 844×390. Si un ajout fait déborder, réduire les marges ou retirer
   du contenu — ne jamais autoriser le scroll sur la home.

3. **Pas de redirection auto de langue.** Servir la page demandée. Le sélecteur FR/EN
   est manuel et mémorise le choix en `localStorage` (clé `orbe-lang`). Relier chaque
   page à son équivalent via `hreflang` pour le SEO.

4. **Marque.** Logo « Orbe IA » (le « IA » en italique doré). Le concept central est la
   CONSTELLATION : des agents (étoiles) qui gravitent autour d'un hub (l'activité du
   client). Ne pas retomber dans l'esthétique « SaaS sombre + glow » générique.

## Direction artistique (tokens)

- Fond : `--bg:#0b0a0d` / `--bg-2:#100e14`, dégradé spatial profond (violet + ambre discrets) + vignette + grain léger.
- Encre : `--ink:#ECE7DC`, `--ink-soft:#9c968a`, `--ink-faint:#5f5a55`.
- Accent : doré `--gold:#d8a657` → `--gold-soft:#f0d29a` → rouille `--rust:#c47a4a`.
- Display : **Instrument Serif** (titres, logo, gros chiffres). Body : **Newsreader**.
- Italique doré (dégradé) réservé aux mots-clés (« en orbite », « IA »).
- Animations : entrée en fondu + montée des lignes de titre ; constellation qui se dessine ;
  étoiles qui scintillent ; respecter `prefers-reduced-motion`.

## Périmètre (à n'écrire qu'UNE fois par page, pas de doublon)

Agents IA · Automatisation · Sites · Applications · Plateformes

## CTA

- Action principale : bouton « Réserver un échange » / « Book a call »
  → https://calendly.com/contact-orbe-ia/30min (nouvel onglet).
- Contact secondaire : contact@orbe-ia.com.

## Ajouter un article au Journal

1. Créer `journal/<slug>.md` (FR) ET `en/journal/<slug>.md` (EN).
   Front-matter : `title`, `description`, `date`, `lang`, `slug`, `translationKey` (identique FR/EN), `readingTime`.
2. Régénérer : `node build.mjs` → index FR + index EN, pages d'article, `sitemap.xml`.
3. Chaque page d'article : `<title>` + meta description uniques, Open Graph,
   JSON-LD (Article + BreadcrumbList), canonical, hreflang FR↔EN.
4. Vérifier que le style reprend les mêmes tokens que la home.

## Build & déploiement

- `node build.mjs` régénère tout le Journal (zéro dépendance npm, parseur Markdown maison).
- Sortie 100 % statique → déployable sur GitHub Pages (branche `main`, racine).
- Fichiers générés (ne pas éditer à la main) : `journal/index.html`, `journal/<slug>.html`,
  `en/journal/index.html`, `en/journal/<slug>.html`, `sitemap.xml`.
- Sources éditables : `*.md`, `index.html`, `en/index.html`, `assets/`, `build.mjs`.

## Performance & a11y

Pages légères, polices préchargées, Lighthouse 95+. Contrastes AA, navigation clavier,
`alt` sur les images, `prefers-reduced-motion` honoré partout.
