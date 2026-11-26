import { describe, expect, it } from "vitest";
import {
  AXES,
  agregerClassement,
  estPermutationDesMesures,
  formaterSource,
  melanger,
  MESURE_IDS,
  MESURES,
} from "@/lib/mesures";
import { parJour } from "@/lib/statistiques";

describe("classement agrégé", () => {
  it("calcule points, rang moyen et nombre de fois en tête", () => {
    const c = agregerClassement(
      [
        ["m03", "m01", "m02", "m04", "m05"],
        ["m01", "m03", "m02", "m06", "m07"],
        ["m03", "m02", "m01", "m08", "m09"],
      ],
      5,
    );
    expect(c[0]).toMatchObject({ points: 14, enTete: 2, selections: 3 });
    expect(c[0]?.mesure.id).toBe("m03");
    expect(c[0]?.rangMoyen).toBeCloseTo(4 / 3);
    expect(c).toHaveLength(24);
    expect(c.find((x) => x.mesure.id === "m24")).toMatchObject({ points: 0, rangMoyen: null });
  });
  it("mélange sans perdre de mesure", () => {
    const m = melanger(MESURES, () => 0.3);
    expect(m).toHaveLength(24);
    expect(new Set(m.map((x) => x.id)).size).toBe(24);
  });
  it("écrit les sources en toutes lettres, sans numéro", () => {
    expect(formaterSource({ organisme: "ciivise", numeros: [26, 28], libelle: "x" })).toBe(
      "Préconisations x",
    );
    expect(formaterSource({ organisme: "fai", numeros: [12], libelle: "x" })).toBe("Proposition x");
    const m01 = MESURES[0]!;
    expect(m01.sources.map(formaterSource)).toEqual([
      "Proposition de Face à l'inceste",
      "Préconisation du rapport de la CIIVISE (novembre 2023)",
      "Proposition de la Commission de l'Assemblée nationale",
    ]);
    const tout = MESURES.flatMap((m) => m.sources.map(formaterSource)).join(" ");
    expect(tout).not.toMatch(/\bFAI\b|Commission AN|(Proposition|Préconisation)s? \d/);
  });
  it("garde les identifiants m01 à m24 et aucun détail non validé", () => {
    expect(MESURE_IDS).toEqual(
      Array.from({ length: 24 }, (_, i) => `m${String(i + 1).padStart(2, "0")}`),
    );
    expect(MESURES.filter((m) => m.detail)).toEqual([]);
  });
  it("liste les axes par ordre alphabétique et reconnaît une permutation des 24 mesures", () => {
    expect(AXES).toHaveLength(8);
    expect([...AXES]).toEqual([...AXES].sort((a, b) => a.localeCompare(b, "fr")));
    expect(estPermutationDesMesures(melanger(MESURE_IDS))).toBe(true);
    expect(estPermutationDesMesures(MESURE_IDS.slice(1))).toBe(false);
  });
  it("compte par jour, jours vides compris", () => {
    expect(parJour(["2026-11-21", "2026-11-23", "2026-11-21"])).toEqual([
      { jour: "2026-11-21", n: 2 },
      { jour: "2026-11-22", n: 0 },
      { jour: "2026-11-23", n: 1 },
    ]);
  });
});
