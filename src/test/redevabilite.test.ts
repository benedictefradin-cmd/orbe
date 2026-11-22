import { describe, expect, it } from "vitest";
import { agregerClassement } from "@/lib/mesures";
import { aMasquer, compteurPublic, rangPublic, resultatsPublics } from "@/lib/statistiques";
import { COMPTEUR, CONSULTATION, PARTAGE } from "@/lib/contenus";
import { DATE_RESULTATS, RESULTATS_PUBLICS } from "@/lib/config";

const reponse = (classement: string[], mesures_rejetees: string[] | null = []) => ({
  classement,
  mesures_rejetees,
});

describe("compteur public et rang", () => {
  it("n'affiche rien sous 100 réponses, puis arrondit à la dizaine inférieure", () => {
    expect(compteurPublic(0)).toBeNull();
    expect(compteurPublic(99)).toBeNull();
    expect(compteurPublic(100)).toBe(100);
    expect(compteurPublic(347)).toBe(340);
    expect(compteurPublic(Number.NaN)).toBeNull();
    expect(COMPTEUR.texte(340)).toBe("Plus de 340 personnes ont déjà répondu.");
  });
  it("ne donne le rang personnel qu'au dessus du seuil", () => {
    expect(rangPublic(42)).toBeNull();
    expect(rangPublic(undefined)).toBeNull();
    expect(rangPublic(342)).toBe(342);
    expect(CONSULTATION.fin.rang(342)).toBe("Vous êtes la 342e personne à répondre.");
  });
  it("le message de partage ne dit jamais que la personne a répondu", () => {
    expect(PARTAGE.message).not.toMatch(/répondu|j'ai|participé/i);
  });
  it("aucune date de résultats ni page de résultats tant que rien n'est décidé", () => {
    expect(DATE_RESULTATS).toBe("");
    expect(CONSULTATION.fin.resultats).toBe("");
    expect(RESULTATS_PUBLICS).toBe(false);
  });
});

describe("agrégats", () => {
  it("affiche les égalités au lieu de les trancher, et calcule le score net", () => {
    const c = agregerClassement(
      [
        ["m05", "m06", "m01", "m02", "m03"],
        ["m06", "m05", "m01", "m02", "m03"],
      ],
      5,
      [["m24", "m24", "m01"], ["m24"]],
    );
    const [a, b, c3] = c;
    expect([a?.mesure.id, b?.mesure.id]).toEqual(["m05", "m06"]);
    expect(a).toMatchObject({ rang: 1, exAequo: true, points: 9 });
    expect(b).toMatchObject({ rang: 1, exAequo: true, points: 9 });
    expect(c3).toMatchObject({ rang: 3, exAequo: false });
    expect(c.find((x) => x.mesure.id === "m24")).toMatchObject({ rejets: 2, net: -2 });
    expect(c.find((x) => x.mesure.id === "m01")).toMatchObject({ rejets: 1, net: 1 });
  });

  it("masque les cases de 1 à 9 réponses, jamais zéro", () => {
    expect([0, 1, 9, 10].map((n) => aMasquer(n))).toEqual([false, true, true, false]);
  });

  it("ne publie rien sous 10 réponses, puis masque les petites cases", () => {
    const top = ["m01", "m02", "m03", "m04", "m05"];
    expect(resultatsPublics(Array.from({ length: 9 }, () => reponse(top)))).toBeNull();
    const r = resultatsPublics([
      ...Array.from({ length: 12 }, () => reponse(top, ["m24"])),
      reponse(["m06", "m01", "m02", "m03", "m04"], null),
    ])!;
    expect(r.total).toBe(10);
    const ligne = (id: string) => r.lignes.find((l) => l.id === id)!;
    expect(ligne("m01")).toMatchObject({ points: 5 * 12 + 4, part: 13 / 13, net: 12 });
    expect(ligne("m06")).toMatchObject({ points: null, part: null });
    expect(ligne("m24")).toMatchObject({ points: 0, part: 0, net: -12 });
    expect(Object.keys(r)).toEqual(["total", "lignes"]);
  });
});
