#!/usr/bin/env python3
# Générateur du Journal ORBE IA — DA crème (identique à la home).
# Usage : python3 build_journal.py
# Produit journal/<slug>.html, en/journal/<slug>.html + les deux index.
# Fichier temporaire : supprimé une fois le journal généré.
import os, html

GOLD_FONTS = ('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:'
              'wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap')

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
           "%3Crect width='32' height='32' rx='7' fill='%23f6f1e7'/%3E"
           "%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23c8841f' stroke-width='1.4' opacity='.6'/%3E"
           "%3Ccircle cx='16' cy='16' r='3' fill='%23c8841f'/%3E%3C/svg%3E")

# CSS crème commun (article + index), repris du gabarit + extensions encart/liste.
CSS = """
:root{
  --bg:#f6f1e7;--bg2:#efe8d8;--ink:#1c1810;--ink-soft:#6b6253;--ink-dim:#9c9384;
  --gold:#c8841f;--gold-deep:#a86a12;--line:rgba(28,24,16,.12);
  --serif:'Schibsted Grotesk',system-ui,sans-serif;--sans:'Outfit',system-ui,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);font-weight:300;line-height:1.75;-webkit-font-smoothing:antialiased}
::selection{background:var(--gold);color:#fff}
img{display:block;max-width:100%}
body::before{content:"";position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode:multiply}
.topbar{display:flex;justify-content:space-between;align-items:center;max-width:760px;margin:0 auto;padding:28px 24px}
.back{font-size:.82rem;letter-spacing:.04em;color:var(--ink-soft);text-decoration:none;transition:.3s}
.back:hover{color:var(--gold-deep)}
.brand{display:flex;align-items:center;gap:16px}
.logo{font-family:var(--serif);font-size:1.1rem;font-weight:700;letter-spacing:-.01em;color:var(--ink);text-decoration:none}
.logo .ia{font-style:italic;color:var(--gold)}
.lang{display:flex;gap:7px;font-size:.76rem;letter-spacing:.08em}
.lang a{color:var(--ink-dim);text-decoration:none}
.lang a.on{color:var(--gold-deep);font-weight:600}
.lang span{color:var(--ink-dim);opacity:.5}
/* Article */
article{max-width:720px;margin:0 auto;padding:32px 24px 40px}
.meta{display:flex;gap:16px;align-items:center;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:22px}
.meta .date{color:var(--gold-deep);font-weight:600}
.meta .cat{color:var(--ink-dim)}
article h1{font-family:var(--serif);font-weight:700;font-size:clamp(2rem,5vw,3.2rem);line-height:1.05;letter-spacing:-.03em;margin-bottom:36px}
article h2{font-family:var(--serif);font-weight:600;font-size:clamp(1.4rem,3vw,1.9rem);letter-spacing:-.02em;margin:44px 0 14px}
article p{color:#2a261d;font-size:1.08rem;margin-bottom:22px}
article a{color:var(--gold-deep);text-decoration:underline;text-underline-offset:3px}
article blockquote{border-left:2px solid var(--gold);padding-left:22px;margin:30px 0;font-family:var(--serif);font-size:1.25rem;font-weight:500;color:var(--ink)}
article ul,article ol{margin:0 0 22px 22px}
article li{font-size:1.08rem;margin-bottom:8px;color:#2a261d}
article strong{font-weight:600;color:var(--ink)}
hr{border:none;border-top:1px solid var(--line);margin:48px 0}
/* Encart « ORBE IA sait le faire » */
.wedo{max-width:720px;margin:8px auto 0;padding:0 24px}
.wedo-box{border:1px solid var(--line);border-radius:14px;padding:32px;background:linear-gradient(160deg,rgba(200,132,31,.07),transparent)}
.wedo-box h3{font-family:var(--serif);font-weight:600;font-size:1.5rem;letter-spacing:-.02em;margin-bottom:12px}
.wedo-box p{color:var(--ink-soft);font-size:1.02rem;margin-bottom:22px}
.wedo-cta{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:var(--bg);padding:15px 30px;border-radius:46px;text-decoration:none;font-size:.95rem;transition:.4s}
.wedo-cta:hover{background:var(--gold-deep);transform:translateY(-2px)}
/* À lire aussi */
.also{max-width:720px;margin:48px auto 0;padding:0 24px}
.also h4{font-size:.74rem;text-transform:uppercase;letter-spacing:.18em;color:var(--ink-dim);margin-bottom:16px}
.also a{display:block;font-family:var(--serif);font-size:1.2rem;font-weight:500;letter-spacing:-.01em;color:var(--ink);text-decoration:none;padding:10px 0;border-top:1px solid var(--line);transition:.3s}
.also a:hover{color:var(--gold-deep)}
/* Footer */
.foot{max-width:760px;margin:56px auto 0;padding:24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:.82rem;color:var(--ink-dim)}
.foot a{color:var(--ink-soft);text-decoration:none}
.foot a:hover{color:var(--gold-deep)}
/* Index */
.j-head{max-width:760px;margin:0 auto;padding:24px 24px 8px}
.j-head .eyebrow{font-size:.72rem;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-deep);font-weight:600;margin-bottom:16px;display:inline-flex;align-items:center;gap:11px}
.j-head .eyebrow::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(200,132,31,.15)}
.j-head h1{font-family:var(--serif);font-weight:700;font-size:clamp(2.4rem,6vw,4rem);line-height:1.02;letter-spacing:-.03em;margin-bottom:16px}
.j-head h1 em{font-style:normal;color:var(--gold-deep)}
.j-head p{color:var(--ink-soft);font-size:1.1rem;max-width:46ch}
.list{max-width:760px;margin:24px auto 0;padding:0 24px}
.entry{display:grid;grid-template-columns:1fr auto;gap:8px 24px;align-items:baseline;padding:24px 0;border-top:1px solid var(--line);text-decoration:none;color:inherit;transition:padding-left .35s}
.list .entry:last-child{border-bottom:1px solid var(--line)}
.entry:hover{padding-left:8px}
.entry .cat{grid-column:1;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-deep);font-weight:600}
.entry h2{grid-column:1;font-family:var(--serif);font-weight:600;font-size:clamp(1.25rem,2.6vw,1.7rem);line-height:1.15;letter-spacing:-.02em;transition:color .3s}
.entry:hover h2{color:var(--gold-deep)}
.entry .ex{grid-column:1;color:var(--ink-soft);font-size:.98rem;margin-top:4px;max-width:60ch}
.entry .date{grid-column:2;grid-row:1/3;font-size:.8rem;color:var(--ink-dim);white-space:nowrap;text-align:right}
@media(max-width:640px){.entry{grid-template-columns:1fr}.entry .date{grid-column:1;grid-row:auto;text-align:left}}
"""


def jsonld(title, desc, slug, date, lang, base):
    bc_journal = base + "/journal/" if lang == "fr" else base + "/en/journal/"
    url = bc_journal + slug + ".html"
    art = ('{"@context":"https://schema.org","@type":"Article","headline":%s,'
           '"description":%s,"datePublished":"%s","inLanguage":"%s",'
           '"author":{"@type":"Organization","name":"ORBE IA"},'
           '"publisher":{"@type":"Organization","name":"ORBE IA"},'
           '"mainEntityOfPage":%s}') % (jstr(title), jstr(desc), date, lang, jstr(url))
    bc = ('{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
          '{"@type":"ListItem","position":1,"name":"Journal","item":%s},'
          '{"@type":"ListItem","position":2,"name":%s,"item":%s}]}') % (jstr(bc_journal), jstr(title), jstr(url))
    return "[%s,%s]" % (art, bc)


def jstr(s):
    import json
    return json.dumps(s, ensure_ascii=False)


def render_article(a, lang):
    base = "https://orbe-ia.com"
    if lang == "fr":
        slug, other_slug = a["slug"], a["en"]
        title, desc, date_disp, cat = a["title"], a["desc"], a["date_fr"], a["cat"]
        body, wedo_h, wedo_p = a["body_fr"], a["wedo_h_fr"], a["wedo_p_fr"]
        also_h, related = "À lire aussi", a["rel_fr"]
        cta = "J'automatise mon entreprise ↗"
        back, home, journal_idx = "← Journal", "../index.html", "index.html"
        canonical = f"{base}/journal/{slug}.html"
        fr_href, en_href = f"/journal/{slug}.html", f"/en/journal/{other_slug}.html"
        lang_html, og_loc = "fr", "fr_FR"
        lang_block = f'<a href="/journal/{slug}.html" class="on">FR</a><span>/</span><a href="/en/journal/{other_slug}.html">EN</a>'
    else:
        slug, other_slug = a["en"], a["slug"]
        title, desc, date_disp, cat = a["title_en"], a["desc_en"], a["date_en"], a["cat_en"]
        body, wedo_h, wedo_p = a["body_en"], a["wedo_h_en"], a["wedo_p_en"]
        also_h, related = "Read next", a["rel_en"]
        cta = "Automate my business ↗"
        back, home, journal_idx = "← Journal", "/", "index.html"
        canonical = f"{base}/en/journal/{slug}.html"
        fr_href, en_href = f"/journal/{other_slug}.html", f"/en/journal/{slug}.html"
        lang_html, og_loc = "en", "en_US"
        lang_block = f'<a href="/journal/{other_slug}.html">FR</a><span>/</span><a href="/en/journal/{slug}.html" class="on">EN</a>'

    also_links = "".join(f'<a href="{href}">{html.escape(label)}</a>' for href, label in related)
    return f"""<!DOCTYPE html>
<html lang="{lang_html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)} — ORBE IA</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="fr" href="{base}{fr_href}">
<link rel="alternate" hreflang="en" href="{base}{en_href}">
<link rel="alternate" hreflang="x-default" href="{base}{fr_href}">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(title)} — ORBE IA">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{base}/assets/showcase-1.png">
<meta property="og:locale" content="{og_loc}">
<meta property="og:url" content="{canonical}">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{GOLD_FONTS}" rel="stylesheet">
<script type="application/ld+json">{jsonld(title, desc, slug, a['iso'], lang, base)}</script>
<style>{CSS}</style>
</head>
<body>
<header class="topbar">
  <a href="{journal_idx}" class="back">{back}</a>
  <div class="brand">
    <div class="lang">{lang_block}</div>
    <a href="{home}" class="logo">ORBE <span class="ia">IA</span></a>
  </div>
</header>
<article>
  <div class="meta"><span class="date">{html.escape(date_disp)}</span><span class="cat">{html.escape(cat)}</span></div>
  <h1>{html.escape(title)}</h1>
{body}
</article>
<section class="wedo"><div class="wedo-box">
  <h3>{html.escape(wedo_h)}</h3>
  <p>{html.escape(wedo_p)}</p>
  <a href="https://calendly.com/contact-orbe-ia/30min" target="_blank" rel="noopener" class="wedo-cta">{cta}</a>
</div></section>
<section class="also"><h4>{also_h}</h4>{also_links}</section>
<footer class="foot">
  <span>© 2026 ORBE IA — agence sur mesure</span>
  <a href="mailto:contact@orbe-ia.com">contact@orbe-ia.com</a>
</footer>
</body>
</html>
"""


def render_index(articles, lang):
    base = "https://orbe-ia.com"
    if lang == "fr":
        title = "Journal — ORBE IA"
        desc = "Idées, méthodes et repères sur l'IA, l'automatisation et les outils qui font gagner du temps."
        eyebrow, h1a, h1b, lead = "Le journal", "Ce qu'on apprend,", "on le partage.", desc
        home, canonical = "../index.html", base + "/journal/"
        lang_block = f'<a href="/journal/" class="on">FR</a><span>/</span><a href="/en/journal/">EN</a>'
        back, og_loc, lang_html = "← Accueil", "fr_FR", "fr"
        read = "min de lecture"
    else:
        title = "Journal — ORBE IA"
        desc = "Ideas, methods and signposts on AI, automation and the tools that save time."
        eyebrow, h1a, h1b, lead = "The journal", "What we learn,", "we share.", desc
        home, canonical = "/", base + "/en/journal/"
        lang_block = f'<a href="/journal/">FR</a><span>/</span><a href="/en/journal/" class="on">EN</a>'
        back, og_loc, lang_html = "← Home", "en_US", "en"
        read = "min read"
    rows = []
    for a in articles:
        if lang == "fr":
            href, cat, h2, ex, date = f"{a['slug']}.html", a["cat"], a["title"], a["desc"], a["date_fr"]
        else:
            href, cat, h2, ex, date = f"{a['en']}.html", a["cat_en"], a["title_en"], a["desc_en"], a["date_en"]
        rows.append(f"""    <a class="entry" href="{href}">
      <span class="cat">{html.escape(cat)}</span>
      <h2>{html.escape(h2)}</h2>
      <span class="ex">{html.escape(ex)}</span>
      <span class="date">{html.escape(date)}<br>{a['min']} {read}</span>
    </a>""")
    rows_html = "\n".join(rows)
    return f"""<!DOCTYPE html>
<html lang="{lang_html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="fr" href="{base}/journal/">
<link rel="alternate" hreflang="en" href="{base}/en/journal/">
<link rel="alternate" hreflang="x-default" href="{base}/journal/">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:locale" content="{og_loc}">
<meta property="og:url" content="{canonical}">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{GOLD_FONTS}" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<header class="topbar">
  <a href="{home}" class="back">{back}</a>
  <div class="brand">
    <div class="lang">{lang_block}</div>
    <a href="{home}" class="logo">ORBE <span class="ia">IA</span></a>
  </div>
</header>
<div class="j-head">
  <div class="eyebrow">{eyebrow}</div>
  <h1>{h1a} <em>{h1b}</em></h1>
  <p>{html.escape(lead)}</p>
</div>
<div class="list">
{rows_html}
</div>
<footer class="foot">
  <span>© 2026 ORBE IA — agence sur mesure</span>
  <a href="mailto:contact@orbe-ia.com">contact@orbe-ia.com</a>
</footer>
</body>
</html>
"""


# ARTICLES : remplies par batches (voir build_articles_data.py importé).
from articles_data import ARTICLES  # noqa: E402

def main():
    os.makedirs("journal", exist_ok=True)
    os.makedirs("en/journal", exist_ok=True)
    for a in ARTICLES:
        with open(f"journal/{a['slug']}.html", "w", encoding="utf-8") as f:
            f.write(render_article(a, "fr"))
        with open(f"en/journal/{a['en']}.html", "w", encoding="utf-8") as f:
            f.write(render_article(a, "en"))
    with open("journal/index.html", "w", encoding="utf-8") as f:
        f.write(render_index(ARTICLES, "fr"))
    with open("en/journal/index.html", "w", encoding="utf-8") as f:
        f.write(render_index(ARTICLES, "en"))
    print(f"OK — {len(ARTICLES)} articles × 2 langues + 2 index générés.")

if __name__ == "__main__":
    main()
