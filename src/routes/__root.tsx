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
import { STRUCTURES } from "@/lib/contenus";

function PageIntrouvable() {
  return (
    <main id="contenu" className="conteneur conteneur-etroit section">
      <h1 className="titre-principal">Cette page n'existe pas</h1>
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
    <main id="contenu" className="conteneur conteneur-etroit section">
      <h1 className="titre-principal">La page ne s'est pas chargée</h1>
      <p className="mt-4">
        Un problème est survenu de notre côté. Vous pouvez réessayer dans un instant.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
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
    // Chaque page définit son titre, sa description, son adresse canonique et son image de partage.
    // Polices auto hébergées (styles.css) : aucune requête vers un domaine tiers.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1B2A4A" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [STRUCTURES.ir, STRUCTURES.fai].map((s) => ({
            "@type": "Organization",
            name: s.nom,
            url: s.site,
            sameAs: s.reseaux.map((r) => r.url),
          })),
        }).replace(/</g, "\\u003c"),
      },
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
