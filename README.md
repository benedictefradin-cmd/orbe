# ORBE IA

Site vitrine d'ORBE — studio d'automatisation IA & sites web pour indépendants et TPE.
« Le répétitif en orbite. »

## Hébergement

Site statique hébergé sur **GitHub Pages**.

- Page : [`index.html`](index.html)
- Domaine personnalisé : `orbe-ia.com` (fichier [`CNAME`](CNAME))
- Contact : orbe-ai@outlook.com · WhatsApp +33 6 55 81 15 20

## Mise en ligne

1. Activer GitHub Pages : *Settings → Pages → Source : `Deploy from a branch` → branche `main`, dossier `/ (root)`*.
2. Renseigner le domaine `orbe-ia.com` dans *Settings → Pages → Custom domain*.
3. Configurer le DNS chez le registrar (voir ci-dessous).

### DNS pour `orbe-ia.com`

Chez votre registrar, créez :

| Type  | Nom   | Valeur                          |
|-------|-------|---------------------------------|
| A     | @     | 185.199.108.153                 |
| A     | @     | 185.199.109.153                 |
| A     | @     | 185.199.110.153                 |
| A     | @     | 185.199.111.153                 |
| CNAME | www   | benedictefradin-cmd.github.io.  |

Une fois le DNS propagé, cochez **Enforce HTTPS** dans les réglages Pages.
