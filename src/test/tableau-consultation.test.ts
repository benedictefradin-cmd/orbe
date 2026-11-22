import { describe, expect, it } from "vitest";
import {
  classementReponses,
  estProfessionnel,
  FILTRES_PAR_DEFAUT,
  filtrerReponses,
  repartitionMasquee,
  repererDoublons,
  scoreParAxe,
} from "@/lib/statistiques";
import { tableauReponses } from "@/lib/exports";
import { MESURES } from "@/lib/mesures";
import type { ReponseAdmin } from "@/lib/server/services.server";

const base: ReponseAdmin = {
  jour: "2026-11-25",
  age: "25-34",
  genre: "femme",
  region: "idf",
  lieu_vie: "rural",
  situation: "emploi",
  parent: "oui",
  liens_enfance: ["aucun"],
  lien_sujet: [],
  classement: ["m01", "m02", "m03", "m04", "m05"],
  mesure_manquante: null,
  presence_debat: null,
  poids_vote: null,
  provenance: null,
  version_questionnaire: "v2",
  ordre_affichage: ["m01"],
  mesures_rejetees: [],
};

describe("tableau de bord de la consultation", () => {
  it("repère les réponses strictement identiques, jour excepté", () => {
    const d = repererDoublons([
      base,
      { ...base, jour: "2026-11-26" },
      { ...base, age: "35-49" },
      base,
    ]);
    expect(d.copie).toEqual([false, true, false, true]);
    expect(d.copies).toBe(2);
    expect(d.groupes).toBe(1);
    expect(d.sansDoublons).toHaveLength(2);
  });

  it("filtre par personnes concernées, professionnels, provenance, version et doublons", () => {
    const reponses: ReponseAdmin[] = [
      base,
      base,
      { ...base, lien_sujet: ["concerne"], provenance: "reseaux-fai" },
      { ...base, liens_enfance: ["sante"], version_questionnaire: "v1", mesures_rejetees: null },
    ];
    const f = (x: Partial<typeof FILTRES_PAR_DEFAUT>) =>
      filtrerReponses(reponses, { ...FILTRES_PAR_DEFAUT, ...x }).length;
    expect(f({})).toBe(4);
    expect(f({ sansDoublons: true })).toBe(3);
    expect(f({ concernees: "oui" })).toBe(1);
    expect(f({ concernees: "non" })).toBe(3);
    expect(f({ professionnels: "oui" })).toBe(1);
    expect(f({ provenance: "reseaux-fai" })).toBe(1);
    expect(f({ provenance: "sans-reponse" })).toBe(3);
    expect(f({ version: "v1" })).toBe(1);
    expect(estProfessionnel({ liens_enfance: ["nsp"] })).toBe(false);
  });

  it("ramène le score de chaque thème à son nombre de mesures", () => {
    const axes = scoreParAxe(classementReponses([base]));
    const droitPenal = axes.find((a) => a.axe === "Droit pénal")!;
    expect(droitPenal.mesures).toBe(MESURES.filter((m) => m.axe === "Droit pénal").length);
    expect(droitPenal.score).toBe((5 + 4 + 3 + 2 + 1) / droitPenal.mesures);
    expect(axes[0]?.axe).toBe("Droit pénal");
  });

  it("masque les effectifs de 1 à 9 dans les répartitions", () => {
    const valeurs = [...Array(12).fill("a"), ...Array(3).fill("b")] as string[];
    expect(repartitionMasquee(valeurs)).toEqual([
      { valeur: "a", n: 12, masque: false },
      { valeur: "b", n: 3, masque: true },
    ]);
  });

  it("exporte la version, les mesures non soutenues et les réponses identiques", () => {
    const t = tableauReponses([base, { ...base, mesures_rejetees: ["m24"] }, base], 5);
    const col = (nom: string) => t.lignes.map((l) => l[t.entetes.indexOf(nom)]);
    expect(col("Identique à une réponse précédente")).toEqual(["", "", "Oui"]);
    expect(col("Mesures non soutenues")).toEqual(["", "M24", ""]);
    expect(col("Version du questionnaire")).toEqual(["v2", "v2", "v2"]);
  });
});
