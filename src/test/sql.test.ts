import { beforeEach, describe, expect, it } from "vitest";
import { rpc } from "@/lib/server/db.server";
import { nouvelleBase } from "./base-de-test";

const ateliers = (cap: number | null) => [
  {
    id: "atelier-1",
    titre: "A1",
    debut: "2026-12-14T16:30:00+01:00",
    fin: "2026-12-14T18:00:00+01:00",
    capacite: cap,
  },
  {
    id: "atelier-2",
    titre: "A2",
    debut: "2026-12-18T12:30:00+01:00",
    fin: "2026-12-18T14:00:00+01:00",
    capacite: cap,
  },
];
const personne = (n: number, dates = ["atelier-1"]) => ({
  prenom: `P${n}`,
  nom: "N",
  email: `p${n}@exemple.fr`,
  ateliers: dates,
  situations: [],
  actualites_ir: false,
  actualites_fai: true,
});
type Res = { statut: string; jeton?: string; dates?: { atelier_id: string; statut: string }[] };

describe("fonctions SQL", () => {
  beforeEach(async () => {
    await nouvelleBase();
  });

  it("remplit, met en liste d'attente, puis fait monter le suivant à l'annulation", async () => {
    await rpc("synchroniser_ateliers", { _ateliers: ateliers(2) });
    const a = await rpc<Res>("inscrire_atelier", { r: personne(1) });
    const b = await rpc<Res>("inscrire_atelier", { r: personne(2, ["atelier-1", "atelier-2"]) });
    const c = await rpc<Res>("inscrire_atelier", { r: personne(3) });
    expect(a.dates?.[0]?.statut).toBe("inscrit");
    expect(b.dates?.map((d) => d.statut)).toEqual(["inscrit", "inscrit"]);
    expect(c.dates?.[0]?.statut).toBe("liste_attente");
    expect(await rpc<Res>("inscrire_atelier", { r: personne(1) })).toEqual({
      statut: "deja_inscrit",
    });

    expect(await rpc<Res>("annuler_par_jeton", { _jeton: a.jeton })).toMatchObject({
      statut: "ok",
      annulees: 1,
    });
    const liste = await rpc<
      {
        email: string;
        dates: { statut: string; promu_le: string | null; annule_par: string | null }[];
      }[]
    >("admin_inscriptions");
    const p3 = liste.find((p) => p.email === "p3@exemple.fr")!;
    expect(p3.dates[0]).toMatchObject({ statut: "inscrit" });
    expect(p3.dates[0]?.promu_le).not.toBeNull();
    expect(liste.find((p) => p.email === "p1@exemple.fr")!.dates[0]).toMatchObject({
      statut: "annule",
      annule_par: "personne",
    });
    expect(liste).toHaveLength(3);
    expect(await rpc<Res>("annuler_par_jeton", { _jeton: a.jeton })).toEqual({
      statut: "deja_annule",
    });
    const places =
      await rpc<{ atelier_id: string; inscrits: number; attente: number }[]>("etat_places");
    expect(places[0]).toMatchObject({ atelier_id: "atelier-1", inscrits: 2, attente: 0 });
  });

  it("sans capacité, aucune liste d'attente", async () => {
    await rpc("synchroniser_ateliers", { _ateliers: ateliers(null) });
    for (let i = 0; i < 40; i++)
      expect((await rpc<Res>("inscrire_atelier", { r: personne(i) })).dates?.[0]?.statut).toBe(
        "inscrit",
      );
  });

  it("limite à 10 envois par heure et par empreinte", async () => {
    for (let i = 0; i < 10; i++)
      expect(await rpc("verifier_limite", { _empreinte: "abc", _max: 10 })).toBe(true);
    expect(await rpc("verifier_limite", { _empreinte: "abc", _max: 10 })).toBe(false);
    expect(await rpc("verifier_limite", { _empreinte: "autre", _max: 10 })).toBe(true);
  });

  it("enregistre une réponse anonyme avec la date du jour seulement", async () => {
    await rpc("enregistrer_reponse", {
      r: {
        jour: "2026-11-21",
        age: "25-34",
        genre: "nsp",
        region: "idf",
        lieu_vie: "rural",
        situation: "emploi",
        parent: "oui",
        liens_enfance: ["sante"],
        lien_sujet: [],
        classement: ["m03", "m01", "m24", "m07", "m10"],
        mesure_manquante: "",
        presence_debat: null,
        poids_vote: "beaucoup",
        provenance: null,
      },
    });
    const [r] = await rpc<Record<string, unknown>[]>("admin_reponses");
    expect(r).toMatchObject({
      jour: "2026-11-21",
      classement: ["m03", "m01", "m24", "m07", "m10"],
      mesure_manquante: null,
    });
    expect(Object.keys(r!)).not.toContain("id");
  });

  it("purge les inscriptions à la date prévue, pas avant", async () => {
    await rpc("synchroniser_ateliers", { _ateliers: ateliers(30) });
    await rpc("inscrire_atelier", { r: personne(1) });
    expect(await rpc("purger_donnees_ateliers", { _a_partir_du: "2099-01-01" })).toBe(0);
    expect(await rpc("purger_donnees_ateliers", { _a_partir_du: "2000-01-01" })).toBe(1);
    expect(await rpc("admin_inscriptions")).toEqual([]);
  });
});
