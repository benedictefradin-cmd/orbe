/**
 * Compteur public des réponses, sans style : le prompt de design décide où et comment l'afficher.
 * La valeur vient du serveur (getEtatSite), déjà arrondie et nulle sous le seuil ou en cas d'erreur.
 * Rien ne s'affiche dans ce cas, jamais de chiffre de repli.
 */
import { COMPTEUR } from "@/lib/contenus";

export function CompteurReponses({
  valeur,
  className,
}: {
  valeur: number | null;
  className?: string;
}) {
  if (valeur === null) return null;
  return <p className={className}>{COMPTEUR.texte(valeur)}</p>;
}
