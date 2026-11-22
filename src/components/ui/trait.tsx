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

/** Le tracé seul, décoratif. */
export function Trait({ geste, className = "" }: { geste: Geste; className?: string }) {
  return (
    <span
      className={`trait trait-${geste} ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: TRACES[geste] }}
    />
  );
}

/** Un mot ou un chiffre souligné ou entouré du trait. */
export function Marque({
  geste,
  children,
}: {
  geste: "souligner" | "entourer";
  children: ReactNode;
}) {
  return (
    <span className={`marque marque-${geste}`}>
      {children}
      <Trait geste={geste} />
    </span>
  );
}
