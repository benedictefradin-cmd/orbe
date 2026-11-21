import { ROBOTS_PRIVE, ROBOTS_PUBLIC } from "@/lib/robots-policy";
import { SITE } from "@/lib/contenus";

export function urlAbsolue(origine: string, chemin: string): string {
  return new URL(chemin, origine).href;
}

/** Métadonnées d'une page, avec l'image de partage en URL absolue sur le domaine courant. */
export function metaPage({
  origine,
  titre = SITE.titre,
  description = SITE.description,
  chemin = "/",
  prive = false,
}: {
  origine?: string | undefined;
  titre?: string;
  description?: string;
  chemin?: string;
  prive?: boolean;
}) {
  return [
    { title: titre },
    { name: "description", content: description },
    { name: "robots", content: prive ? ROBOTS_PRIVE : ROBOTS_PUBLIC },
    { property: "og:title", content: titre },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "fr_FR" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: titre },
    { name: "twitter:description", content: description },
    ...(origine
      ? [
          { property: "og:url", content: urlAbsolue(origine, chemin) },
          { property: "og:image", content: urlAbsolue(origine, SITE.imagePartage) },
          { name: "twitter:image", content: urlAbsolue(origine, SITE.imagePartage) },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:image:alt", content: SITE.imagePartageAlt },
        ]
      : []),
  ];
}
