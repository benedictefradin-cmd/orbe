import { describe, expect, it } from "vitest";
import { ATELIERS } from "@/lib/config";
import { SITUATIONS_ATELIER } from "@/lib/formulaires";
import { organismes, part, profilsParAtelier } from "@/lib/statistiques";
import type { InscriptionAdmin } from "@/lib/server/services.server";

const [a1, a2] = ATELIERS.map((a) => a.id);

function personne(
  id: string,
  structure: string | null,
  situations: string[],
  dates: [string, "inscrit" | "liste_attente" | "annule"][],
): InscriptionAdmin {
  return {
    id,
    structure,
    situations,
    dates: dates.map(([atelier_id, statut]) => ({ atelier_id, statut })),
  } as unknown as InscriptionAdmin;
}

const inscriptions = [
  personne("1", "Maison des familles", ["sante", "parent"], [[a1!, "inscrit"]]),
  personne("2", "maison des  familles ", ["sante"], [[a2!, "liste_attente"]]),
  personne(
    "3",
    "",
    ["education"],
    [
      [a1!, "inscrit"],
      [a2!, "inscrit"],
    ],
  ),
  personne("4", "Ville", ["justice"], [[a1!, "annule"]]),
];

describe("part", () => {
  it("arrondit et protège la division par zéro", () => {
    expect(part(1, 3)).toBe(33);
    expect(part(2, 0)).toBe(0);
  });
});

describe("profilsParAtelier", () => {
  const p = profilsParAtelier(inscriptions, SITUATIONS_ATELIER);

  it("compte les personnes non annulées par colonne", () => {
    expect(p.effectifs).toEqual([
      { id: "tous", n: 3 },
      { id: a1, n: 2 },
      { id: a2, n: 2 },
    ]);
  });

  it("trie les profils et calcule la part par colonne", () => {
    expect(p.lignes[0]!.valeur).toBe("sante");
    expect(p.lignes[0]!.colonnes.map((c) => c.part)).toEqual([67, 50, 50]);
    expect(p.lignes.find((l) => l.valeur === "justice")).toBeUndefined();
  });
});

describe("organismes", () => {
  const o = organismes(inscriptions);

  it("regroupe sans tenir compte de la casse ni des espaces, sans les annulés", () => {
    expect(o.lignes).toHaveLength(1);
    expect(o.lignes[0]).toMatchObject({ personnes: 2, part: 67, ateliers: [a1, a2] });
    expect(o.total).toBe(3);
    expect(o.sansStructure).toBe(1);
  });
});
