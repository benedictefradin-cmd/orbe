export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>La page ne s'est pas chargée</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 17px/1.5 "Source Sans 3", system-ui, sans-serif; background: #fff; color: #0F1E3D; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; text-align: center; }
      h1 { font-size: 1.4rem; color: #1B2A4A; margin: 0 0 .5rem; }
      p { color: #5A6B85; margin: 0 0 1.5rem; }
      a, button { display: inline-flex; align-items: center; min-height: 44px; padding: 0 1.25rem; border-radius: 6px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid #2D5BD7; margin: .25rem; }
      .primary { background: #2D5BD7; color: #fff; }
      .secondary { background: #fff; color: #2D5BD7; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>La page ne s'est pas chargée</h1>
      <p>Un problème est survenu de notre côté. Vous pouvez réessayer dans un instant.</p>
      <button class="primary" onclick="location.reload()">Réessayer</button>
      <a class="secondary" href="/">Retour à l'accueil</a>
    </div>
  </body>
</html>`;
}
