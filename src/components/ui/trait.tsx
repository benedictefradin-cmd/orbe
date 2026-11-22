/**
 * Trait corail dessiné à la main, seul ornement du site. Le SVG est inséré en ligne
 * (couleur par currentColor, pathLength="1" pour l'animation du tracé).
 * Pour remplacer un tracé : src/assets/traits/README.md.
 */
import type { ReactNode } from "react";
import souligner from "@/assets/traits/souligner.svg?raw";
import entourer from "@/assets/traits/entourer.svg?raw";
import fleche from "@/assets/traits/fleche.svg?raw";

const TRACES = { souligner, entourer, fleche } as const;
export type Geste = keyof typeof TRACES;

/** Le tracé seul, décoratif. `motion` nomme son animation de tracé (src/motion.css). */
export function Trait({
  geste,
  className = "",
  motion,
}: {
  geste: Geste;
  className?: string;
  motion?: string | undefined;
}) {
  return (
    <span
      className={`trait trait-${geste} ${className}`}
      aria-hidden="true"
      data-motion={motion}
      dangerouslySetInnerHTML={{ __html: TRACES[geste] }}
    />
  );
}

/** Un mot ou un chiffre souligné ou entouré du trait. */
export function Marque({
  geste,
  children,
  motion,
}: {
  geste: "souligner" | "entourer";
  children: ReactNode;
  motion?: string | undefined;
}) {
  return (
    // Le trait avant le texte : placé après, il ajouterait une espace au nom accessible (« Merci . Votre »).
    <span className={`marque marque-${geste}`}>
      <Trait geste={geste} motion={motion} />
      {children}
    </span>
  );
}
