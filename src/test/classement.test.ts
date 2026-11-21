import { describe, expect, it } from "vitest";
import { agregerClassement, melanger, MESURES } from "@/lib/mesures";
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
  it("compte par jour, jours vides compris", () => {
    expect(parJour(["2026-11-21", "2026-11-23", "2026-11-21"])).toEqual([
      { jour: "2026-11-21", n: 2 },
      { jour: "2026-11-22", n: 0 },
      { jour: "2026-11-23", n: 1 },
    ]);
  });
});
