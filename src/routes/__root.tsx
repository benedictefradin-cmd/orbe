import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

function PageIntrouvable() {
  return (
    <main id="contenu" className="conteneur conteneur-etroit section text-center">
      <h1 className="titre-section">Cette page n'existe pas</h1>
      <p className="mt-4">Le lien est peut être incomplet, ou la page a été déplacée.</p>
      <Link to="/" className="bouton bouton-plein mt-8">
        Retour à l'accueil
      </Link>
    </main>
  );
}

function PageErreur({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <main id="contenu" className="conteneur conteneur-etroit section text-center">
      <h1 className="titre-section">La page ne s'est pas chargée</h1>
      <p className="mt-4">
        Un problème est survenu de notre côté. Vous pouvez réessayer dans un instant.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="bouton bouton-plein"
          onClick={() => {
            void router.invalidate();
            reset();
          }}
        >
          Réessayer
        </button>
        <a href="/" className="bouton bouton-contour">
          Retour à l'accueil
        </a>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Chaque page définit son titre, sa description et son image de partage.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1B2A4A" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Spectral:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: Coquille,
  component: Racine,
  notFoundComponent: PageIntrouvable,
  errorComponent: PageErreur,
});

function Coquille({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Racine() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
