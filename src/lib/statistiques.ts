/** Calculs du tableau de bord, purs et testables. */
import {
  ATELIERS,
  COMPTEUR_ACTIF,
  jourParis,
  NOMBRE_MESURES_A_CLASSER,
  SEUIL_COMPTEUR,
  SEUIL_DIFFUSION,
} from "@/lib/config";
import { agregerClassement } from "@/lib/mesures";
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

/* ───────────── Seuils de diffusion ───────────── */

/** Vrai si un effectif doit être masqué : entre 1 et le seuil exclu. Zéro ne révèle personne. */
export function aMasquer(n: number, seuil = SEUIL_DIFFUSION): boolean {
  return n > 0 && n < seuil;
}

/** Nombre public de réponses : rien sous le seuil, arrondi à la dizaine inférieure au delà. */
export function compteurPublic(n: number): number | null {
  if (!COMPTEUR_ACTIF || !Number.isFinite(n) || n < SEUIL_COMPTEUR) return null;
  return Math.floor(n / 10) * 10;
}

/** Rang affiché à la personne qui vient de répondre, seulement si le compteur public est affiché. */
export function rangPublic(rang: number | null | undefined): number | null {
  if (!COMPTEUR_ACTIF || !rang || rang < SEUIL_COMPTEUR) return null;
  return rang;
}

/* ───────────── Résultats publics (agrégats seulement) ───────────── */

export type LigneResultat = {
  id: string;
  axe: string;
  texte: string;
  rang: number;
  exAequo: boolean;
  /** Points de Borda, null si masqué. */
  points: number | null;
  /** Part des personnes qui ont retenu la mesure (0 à 1), null si masquée. */
  part: number | null;
  /** Retenues moins rejets, sur les seules réponses qui ont vu la question des rejets, null si masqué. */
  net: number | null;
};
export type ResultatsPublics = {
  /** Nombre de réponses arrondi à la dizaine inférieure. */
  total: number;
  lignes: LigneResultat[];
};

/** Agrégats publiables. Rien sous le seuil de diffusion, et chaque case de moins de 10 réponses masquée. */
export function resultatsPublics(
  reponses: readonly Pick<ReponseAdmin, "classement" | "mesures_rejetees">[],
): ResultatsPublics | null {
  if (reponses.length < SEUIL_DIFFUSION) return null;
  const n = NOMBRE_MESURES_A_CLASSER;
  const tout = agregerClassement(
    reponses.map((r) => r.classement),
    n,
  );
  const v2 = reponses.filter((r) => r.mesures_rejetees !== null);
  const net = new Map(
    agregerClassement(
      v2.map((r) => r.classement),
      n,
      v2.map((r) => r.mesures_rejetees ?? []),
    ).map((l) => [l.mesure.id, l]),
  );
  return {
    total: Math.floor(reponses.length / 10) * 10,
    lignes: tout.map((l) => {
      const masque = aMasquer(l.selections);
      const n2 = net.get(l.mesure.id)!;
      const netMasque =
        v2.length < SEUIL_DIFFUSION || aMasquer(n2.selections) || aMasquer(n2.rejets);
      return {
        id: l.mesure.id,
        axe: l.mesure.axe,
        texte: l.mesure.texte,
        rang: l.rang,
        exAequo: l.exAequo,
        points: masque ? null : l.points,
        part: masque ? null : l.selections / reponses.length,
        net: netMasque ? null : n2.net,
      };
    }),
  };
}
