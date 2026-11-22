// @vitest-environment node
import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { nomFichier, tableauReponses, versXlsx } from "@/lib/exports";
import type { ReponseAdmin } from "@/lib/server/services.server";

const r: ReponseAdmin = {
  jour: "2026-11-21",
  age: "25-34",
  genre: "femme",
  region: "idf",
  lieu_vie: "rural",
  situation: "emploi",
  parent: "oui",
  liens_enfance: ["sante"],
  lien_sujet: [],
  classement: ["m03", "m01", "m24", "m07", "m10"],
  mesure_manquante: "=1+1",
  presence_debat: null,
  poids_vote: "beaucoup",
  provenance: null,
  version_questionnaire: "v2",
  ordre_affichage: ["m03", "m01"],
  mesures_rejetees: [],
};

describe("export Excel", () => {
  it("nomme les fichiers avec la date du jour", () => {
    expect(nomFichier("reponses-consultation", "xlsx", new Date("2026-11-21T23:30:00Z"))).toBe(
      "reponses-consultation-2026-11-22.xlsx",
    );
    expect(nomFichier("inscriptions-ateliers", "csv", new Date("2026-11-21T10:00:00Z"))).toBe(
      "inscriptions-ateliers-2026-11-21.csv",
    );
  });
  it("fige la ligne d'en tête, une colonne par question, en français, formules neutralisées", async () => {
    const t = tableauReponses([r], 5);
    const buffer = await versXlsx(t);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.worksheets[0]!;
    expect(ws.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(ws.getRow(1).getCell(2).value).toBe("Votre âge");
    expect(ws.getRow(1).cellCount).toBe(t.entetes.length);
    expect(ws.getRow(2).getCell(10).value).toMatch(/^M03 · Rendre imprescriptibles/);
    const cellule = ws.getRow(2).getCell(t.entetes.indexOf("Une mesure manque selon vous ?") + 1);
    expect(cellule.value).toBe("'=1+1");
    expect(cellule.formula).toBeUndefined();
    const version = ws.getRow(2).getCell(t.entetes.indexOf("Version du questionnaire") + 1);
    expect(version.value).toBe("v2");
    expect(ws.getRow(2).getCell(t.entetes.indexOf("Ordre d'affichage des mesures") + 1).value).toBe(
      "M03 M01",
    );
  });
});
