/** Calculs du tableau de bord, purs et testables. */
import { ATELIERS, jourParis } from "@/lib/config";
import type { InscriptionAdmin, ReponseAdmin } from "@/lib/server/services.server";

export function parJour(jours: readonly string[]): { jour: string; n: number }[] {
  const compte = new Map<string, number>();
  for (const j of jours) compte.set(j, (compte.get(j) ?? 0) + 1);
  const tries = [...compte.keys()].sort();
  if (!tries.length) return [];
  const out: { jour: string; n: number }[] = [];
  for (
    let d = new Date(`${tries[0]}T12:00:00Z`);
    d.toISOString().slice(0, 10) <= tries[tries.length - 1]!;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const j = d.toISOString().slice(0, 10);
    out.push({ jour: j, n: compte.get(j) ?? 0 });
  }
  return out;
}

export function repartition(valeurs: readonly string[]): { valeur: string; n: number }[] {
  const compte = new Map<string, number>();
  for (const v of valeurs) compte.set(v, (compte.get(v) ?? 0) + 1);
  return [...compte.entries()].map(([valeur, n]) => ({ valeur, n })).sort((a, b) => b.n - a.n);
}

export function statsAteliers(inscriptions: readonly InscriptionAdmin[]) {
  const dates = inscriptions.flatMap((i) => i.dates.map((d) => ({ ...d, personne: i })));
  return {
    inscrits: dates.filter((d) => d.statut === "inscrit").length,
    attente: dates.filter((d) => d.statut === "liste_attente").length,
    annulations: dates.filter((d) => d.statut === "annule").length,
    deuxDates: inscriptions.filter((i) => i.dates.filter((d) => d.statut !== "annule").length === 2)
      .length,
    personnesActives: inscriptions.filter((i) => i.dates.some((d) => d.statut !== "annule")).length,
    parAtelier: ATELIERS.map((a) => ({
      atelier: a,
      inscrits: dates.filter((d) => d.atelier_id === a.id && d.statut === "inscrit").length,
      attente: dates.filter((d) => d.atelier_id === a.id && d.statut === "liste_attente").length,
    })),
    aPrevenir: dates.filter((d) => d.statut === "inscrit" && d.promu_le && !d.prevenu_le),
    parJour: parJour(inscriptions.map((i) => jourParis(i.cree_le))),
  };
}

/** Adresses des personnes inscrites à un atelier, sans annulés ni liste d'attente. */
export function adressesInscrits(
  inscriptions: readonly InscriptionAdmin[],
  atelierId: string,
): string[] {
  return inscriptions
    .filter((i) => i.dates.some((d) => d.atelier_id === atelierId && d.statut === "inscrit"))
    .map((i) => i.email);
}

export function statsConsultation(reponses: readonly ReponseAdmin[], aujourdhui: string) {
  return {
    total: reponses.length,
    duJour: reponses.filter((r) => r.jour === aujourdhui).length,
    parJour: parJour(reponses.map((r) => r.jour)),
    mesuresManquantes: reponses.map((r) => r.mesure_manquante).filter((t): t is string => !!t),
  };
}
