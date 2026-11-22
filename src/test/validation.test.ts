import { describe, expect, it } from "vitest";
import {
  consultationSchema,
  envoiConsultationSchema,
  erreursParChamp,
  inscriptionSchema,
} from "@/lib/formulaires";
import { MESURE_IDS } from "@/lib/mesures";

export const reponseValide = {
  age: "25-34",
  genre: "nsp",
  region: "idf",
  lieuVie: "rural",
  situation: "emploi",
  parent: "oui",
  liensEnfance: ["sante", "education"],
  lienSujet: [],
  classement: ["m03", "m01", "m24", "m07", "m10"],
  mesureManquante: "",
  presenceDebat: null,
  poidsVote: "beaucoup",
  provenance: "reseaux-ir",
  ordreAffichage: [...MESURE_IDS].reverse(),
};
export const inscriptionValide = {
  ateliers: ["atelier-1"],
  prenom: "Camille",
  nom: "Martin",
  email: "Camille@Exemple.fr",
  departement: "",
  situations: ["parent"],
  situationAutre: "",
  structure: "",
  motivation: "",
  accessibilite: "",
  majeur: true,
  consentementOrganisation: true,
  actualitesIr: false,
  actualitesFai: true,
};

describe("validation de la consultation", () => {
  it("accepte une réponse complète", () => {
    expect(consultationSchema.safeParse(reponseValide).success).toBe(true);
  });
  it("exige une réponse ou « Je préfère ne pas répondre » pour chaque question du profil", () => {
    const r = consultationSchema.safeParse({ ...reponseValide, age: null, liensEnfance: [] });
    expect(r.success).toBe(false);
    const e = erreursParChamp(r.error!);
    expect(e["age"]).toMatch(/Je préfère ne pas répondre/);
    expect(e["liensEnfance"]).toMatch(/au moins une réponse/);
  });
  it("refuse « Je préfère ne pas répondre » combiné à une autre réponse", () => {
    expect(
      consultationSchema.safeParse({ ...reponseValide, liensEnfance: ["nsp", "sante"] }).success,
    ).toBe(false);
  });
  it("exige exactement 5 mesures distinctes", () => {
    expect(
      consultationSchema.safeParse({ ...reponseValide, classement: ["m01", "m02"] }).success,
    ).toBe(false);
    expect(
      consultationSchema.safeParse({
        ...reponseValide,
        classement: ["m01", "m01", "m02", "m03", "m04"],
      }).success,
    ).toBe(false);
    expect(
      consultationSchema.safeParse({
        ...reponseValide,
        classement: ["m01", "m02", "m03", "m04", "x99"],
      }).success,
    ).toBe(false);
  });
  it("exige l'ordre d'affichage des 24 mesures, chacune une fois", () => {
    const envoi = { ...reponseValide, siteWeb: "", jeton: "x" };
    expect(envoiConsultationSchema.safeParse(envoi).success).toBe(true);
    for (const ordreAffichage of [
      [],
      MESURE_IDS.slice(1),
      [...MESURE_IDS.slice(1), "m02"],
      [...MESURE_IDS.slice(1), "x99"],
    ])
      expect(envoiConsultationSchema.safeParse({ ...envoi, ordreAffichage }).success).toBe(false);
  });
  it("n'enregistre jamais une réponse de moins de 15 ans", () => {
    const e = erreursParChamp(
      consultationSchema.safeParse({ ...reponseValide, age: "moins-15" }).error!,
    );
    expect(e["age"]).toMatch(/à partir de 15 ans/);
  });
  it("exige un accord explicite pour « personne concernée », jamais pour les autres réponses", () => {
    const sans = consultationSchema.safeParse({ ...reponseValide, lienSujet: ["concerne"] });
    expect(erreursParChamp(sans.error!)["consentementConcerne"]).toMatch(/case d'accord/);
    const envoi = { ...reponseValide, lienSujet: ["concerne"], siteWeb: "", jeton: "x" };
    expect(envoiConsultationSchema.safeParse(envoi).success).toBe(false);
    expect(
      envoiConsultationSchema.safeParse({ ...envoi, consentementConcerne: true }).success,
    ).toBe(true);
    expect(
      consultationSchema.safeParse({ ...reponseValide, lienSujet: ["connait-victime"] }).success,
    ).toBe(true);
  });
  it("accepte 3 mesures non soutenues au plus, jamais une mesure du classement", () => {
    const ok = consultationSchema.safeParse({ ...reponseValide, mesuresRejetees: ["m02", "m05"] });
    expect(ok.success && ok.data.mesuresRejetees).toEqual(["m02", "m05"]);
    expect(consultationSchema.parse(reponseValide).mesuresRejetees).toEqual([]);
    expect(
      consultationSchema.safeParse({
        ...reponseValide,
        mesuresRejetees: ["m02", "m04", "m05", "m06"],
      }).success,
    ).toBe(false);
    const croise = consultationSchema.safeParse({ ...reponseValide, mesuresRejetees: ["m03"] });
    expect(erreursParChamp(croise.error!)["mesuresRejetees"]).toMatch(/classement/);
  });
  it("limite la mesure manquante à 500 caractères", () => {
    expect(
      consultationSchema.safeParse({ ...reponseValide, mesureManquante: "a".repeat(501) }).success,
    ).toBe(false);
  });
});

describe("validation de l'inscription", () => {
  it("accepte une inscription et met l'email en minuscules", () => {
    const r = inscriptionSchema.parse(inscriptionValide);
    expect(r.email).toBe("camille@exemple.fr");
  });
  it("donne des messages en français sous chaque champ", () => {
    const r = inscriptionSchema.safeParse({
      ...inscriptionValide,
      ateliers: [],
      prenom: "",
      email: "pas-un-email",
      majeur: false,
      consentementOrganisation: false,
    });
    const e = erreursParChamp(r.error!);
    expect(e).toMatchObject({
      ateliers: "Choisissez au moins une date.",
      prenom: "Indiquez votre prénom.",
      majeur: expect.stringMatching(/18 ans/),
      consentementOrganisation: expect.stringMatching(/accord/),
    });
    expect(e["email"]).toMatch(/adresse email valide/);
  });
  it("demande de préciser la situation « autre »", () => {
    const e = erreursParChamp(
      inscriptionSchema.safeParse({ ...inscriptionValide, situations: ["autre"] }).error!,
    );
    expect(e["situationAutre"]).toBe("Précisez votre situation.");
  });
  it("limite la motivation à 1 000 caractères", () => {
    expect(
      inscriptionSchema.safeParse({ ...inscriptionValide, motivation: "a".repeat(1001) }).success,
    ).toBe(false);
  });
});
