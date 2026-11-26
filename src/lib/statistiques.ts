/** Calculs du tableau de bord, purs et testables. */
import {
  ATELIERS,
  COMPTEUR_ACTIF,
  jourParis,
  NOMBRE_MESURES_A_CLASSER,
  SEUIL_COMPTEUR,
  SEUIL_DIFFUSION,
} from "@/lib/config";
import { agregerClassement, MESURES, type LigneClassement } from "@/lib/mesures";
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

/** Part en pourcentage, arrondie à l'unité. Zéro si le total est nul. */
export function part(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

/** Inscriptions non annulées (inscrit ou liste d'attente) d'un atelier, ou de tous. */
function personnesActives(inscriptions: readonly InscriptionAdmin[], atelierId?: string) {
  return inscriptions.filter((i) =>
    i.dates.some((d) => d.statut !== "annule" && (!atelierId || d.atelier_id === atelierId)),
  );
}

/**
 * Profils par atelier : pour chaque situation, nombre de personnes et part des personnes
 * de la colonne (une personne peut cocher plusieurs situations, le total dépasse 100 %).
 */
export function profilsParAtelier(
  inscriptions: readonly InscriptionAdmin[],
  situations: readonly { valeur: string }[],
) {
  const colonnes = [
    { id: "tous", personnes: personnesActives(inscriptions) },
    ...ATELIERS.map((a) => ({
      id: a.id as string,
      personnes: personnesActives(inscriptions, a.id),
    })),
  ];
  return {
    effectifs: colonnes.map((c) => ({ id: c.id, n: c.personnes.length })),
    lignes: situations
      .map((s) => ({
        valeur: s.valeur,
        colonnes: colonnes.map((c) => {
          const n = c.personnes.filter((p) => p.situations.includes(s.valeur)).length;
          return { id: c.id, n, part: part(n, c.personnes.length) };
        }),
      }))
      .filter((l) => l.colonnes[0]!.n > 0)
      .sort((a, b) => b.colonnes[0]!.n - a.colonnes[0]!.n),
  };
}

/** Organismes représentés, regroupés sans tenir compte de la casse ni des espaces. */
export function organismes(inscriptions: readonly InscriptionAdmin[]) {
  const groupes = new Map<
    string,
    { nom: string; personnes: number; ateliers: Set<string>; situations: Set<string> }
  >();
  for (const i of personnesActives(inscriptions)) {
    const nom = i.structure?.trim();
    if (!nom) continue;
    const cle = nom.toLocaleLowerCase("fr").replace(/\s+/g, " ");
    const g = groupes.get(cle) ?? {
      nom,
      personnes: 0,
      ateliers: new Set<string>(),
      situations: new Set<string>(),
    };
    g.personnes += 1;
    i.dates.filter((d) => d.statut !== "annule").forEach((d) => g.ateliers.add(d.atelier_id));
    i.situations.forEach((s) => g.situations.add(s));
    groupes.set(cle, g);
  }
  const total = personnesActives(inscriptions).length;
  const lignes = [...groupes.values()]
    .map((g) => ({
      nom: g.nom,
      personnes: g.personnes,
      part: part(g.personnes, total),
      ateliers: [...g.ateliers].sort(),
      situations: [...g.situations],
    }))
    .sort((a, b) => b.personnes - a.personnes || a.nom.localeCompare(b.nom, "fr"));
  return {
    lignes,
    total,
    sansStructure: total - lignes.reduce((s, l) => s + l.personnes, 0),
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

/* ───────────── Tableau de bord de la consultation ───────────── */

export type FiltresConsultation = {
  /** « oui » : a coché « personne concernée » ; « non » : ne l'a pas coché. */
  concernees: "toutes" | "oui" | "non";
  /** « oui » : au moins un lien avec l'enfance dans son métier ou engagement. */
  professionnels: "tous" | "oui" | "non";
  /** Valeur de provenance, « sans-reponse » ou « toutes ». */
  provenance: string;
  version: "toutes" | "v1" | "v2";
  sansDoublons: boolean;
};
export const FILTRES_PAR_DEFAUT: FiltresConsultation = {
  concernees: "toutes",
  professionnels: "tous",
  provenance: "toutes",
  version: "toutes",
  sansDoublons: false,
};

export function estConcernee(r: Pick<ReponseAdmin, "lien_sujet">): boolean {
  return r.lien_sujet.includes("concerne");
}

export function estProfessionnel(r: Pick<ReponseAdmin, "liens_enfance">): boolean {
  return r.liens_enfance.some((x) => x !== "aucun" && x !== "nsp");
}

/**
 * Clé d'une réponse : tout ce que la personne a saisi. Le jour et l'ordre d'affichage (tiré
 * au hasard, pas choisi) sont exclus. Deux clés égales = réponses strictement identiques.
 */
export function cleReponse(r: ReponseAdmin): string {
  const { jour: _jour, ordre_affichage: _ordre, ...contenu } = r;
  return JSON.stringify(
    Object.keys(contenu)
      .sort()
      .map((k) => [k, contenu[k as keyof typeof contenu]]),
  );
}

/**
 * Réponses strictement identiques. La première de chaque groupe est gardée, les suivantes
 * sont des copies : « sansDoublons » les retire.
 */
export function repererDoublons(reponses: readonly ReponseAdmin[]) {
  const vues = new Set<string>();
  const copie: boolean[] = [];
  const groupes = new Map<string, number>();
  for (const r of reponses) {
    const cle = cleReponse(r);
    copie.push(vues.has(cle));
    vues.add(cle);
    groupes.set(cle, (groupes.get(cle) ?? 0) + 1);
  }
  return {
    /** Vrai pour chaque réponse qui répète une réponse précédente. */
    copie,
    /** Nombre de copies (réponses en trop). */
    copies: copie.filter(Boolean).length,
    /** Nombre de groupes de réponses identiques (au moins deux). */
    groupes: [...groupes.values()].filter((n) => n > 1).length,
    sansDoublons: reponses.filter((_, i) => !copie[i]),
  };
}

export function filtrerReponses(
  reponses: readonly ReponseAdmin[],
  f: FiltresConsultation,
): ReponseAdmin[] {
  const base = f.sansDoublons ? repererDoublons(reponses).sansDoublons : [...reponses];
  return base.filter(
    (r) =>
      (f.concernees === "toutes" || estConcernee(r) === (f.concernees === "oui")) &&
      (f.professionnels === "tous" || estProfessionnel(r) === (f.professionnels === "oui")) &&
      (f.provenance === "toutes" || (r.provenance ?? "sans-reponse") === f.provenance) &&
      (f.version === "toutes" || r.version_questionnaire === f.version),
  );
}

/** Classement des 24 mesures sur un ensemble de réponses, rejets comptés sur les seules réponses v2. */
export function classementReponses(reponses: readonly ReponseAdmin[]): LigneClassement[] {
  return agregerClassement(
    reponses.map((r) => r.classement),
    NOMBRE_MESURES_A_CLASSER,
    reponses.map((r) => r.mesures_rejetees ?? []),
  );
}

/** Score par axe : points de Borda de l'axe divisés par le nombre de mesures de l'axe. */
export function scoreParAxe(lignes: readonly LigneClassement[]) {
  const axes = new Map<string, { points: number; mesures: number; selections: number }>();
  for (const m of MESURES) {
    const a = axes.get(m.axe) ?? { points: 0, mesures: 0, selections: 0 };
    a.mesures += 1;
    axes.set(m.axe, a);
  }
  for (const l of lignes) {
    const a = axes.get(l.mesure.axe)!;
    a.points += l.points;
    a.selections += l.selections;
  }
  return [...axes.entries()]
    .map(([axe, a]) => ({
      axe,
      mesures: a.mesures,
      selections: a.selections,
      score: a.points / a.mesures,
    }))
    .sort((x, y) => y.score - x.score || x.axe.localeCompare(y.axe, "fr"));
}

/** Répartition avec masquage : une valeur de 1 à 9 réponses n'affiche pas son effectif. */
export function repartitionMasquee(valeurs: readonly string[]) {
  return repartition(valeurs).map((l) => ({ ...l, masque: aMasquer(l.n) }));
}
