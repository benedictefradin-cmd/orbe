import { beforeEach, describe, expect, it, vi } from "vitest";
import { creerJeton } from "@/lib/server/anti-robot.server";
import {
  annulerInscription,
  donneesAdmin,
  etatSite,
  enregistrerConsultation,
  enregistrerContactSuite,
  enregistrerInscription,
  synchroniserAteliers,
  type ResultatInscription,
} from "@/lib/server/services.server";
import { tableauContactsSuite, tableauInscriptions, tableauReponses, versCsv } from "@/lib/exports";
import { COOKIE_PARTICIPATION, cookieParticipation } from "@/lib/server/participation.server";
import { statsAteliers, adressesInscrits } from "@/lib/statistiques";
import { CAPACITE_PAR_ATELIER } from "@/lib/config";
import { rpc } from "@/lib/server/db.server";
import { nouvelleBase } from "./base-de-test";
import { inscriptionValide, reponseValide } from "./validation.test";

const AVANT = new Date("2026-11-25T10:00:00+01:00");
const reponseSqlServeur = {
  jour: "2026-11-25",
  age: "25-34",
  genre: "nsp",
  region: "idf",
  lieu_vie: "rural",
  situation: "emploi",
  parent: "oui",
  liens_enfance: ["sante"],
  lien_sujet: [],
  classement: ["m03", "m01", "m24", "m07", "m10"],
};
const headers = (ip = "203.0.113.7") => new Headers({ "x-forwarded-for": ip });
const vieux = (f: string) => creerJeton(f, Date.now() - 21_000);
const personne = (n: number, ateliers = ["atelier-1"]) => ({
  ...inscriptionValide,
  prenom: `P${n}`,
  email: `p${n}@exemple.fr`,
  ateliers,
});

describe("parcours côté serveur, sur un vrai Postgres", () => {
  beforeEach(async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "cle-de-test-uniquement-0123456789abcdef");
    vi.stubEnv("IP_HASH_SALT", "sel-de-test-0123456");
    await nouvelleBase();
    await synchroniserAteliers(true);
  });

  it("une réponse va dans l'export consultation et jamais dans l'export ateliers, et inversement", async () => {
    expect(
      await enregistrerConsultation(
        {
          ...reponseValide,
          mesureManquante: "MARQUEUR_CONSULTATION",
          siteWeb: "",
          jeton: await vieux("consultation"),
        },
        headers(),
        AVANT,
      ),
    ).toEqual({ ok: true, rang: null });
    const r = await enregistrerInscription(
      { ...personne(1), nom: "MARQUEUR_ATELIER", siteWeb: "", jeton: await vieux("inscription") },
      headers(),
      AVANT,
    );
    expect(r.ok).toBe(true);
    const d = await donneesAdmin(AVANT);
    const csvConsultation = versCsv(tableauReponses(d.reponses, 5));
    const csvAteliers = versCsv(tableauInscriptions(d.inscriptions, "https://exemple.fr"));
    expect(csvConsultation).toContain("MARQUEUR_CONSULTATION");
    expect(csvConsultation).not.toContain("MARQUEUR_ATELIER");
    expect(csvAteliers).toContain("MARQUEUR_ATELIER");
    expect(csvAteliers).not.toContain("MARQUEUR_CONSULTATION");
    expect(d.reponses[0]).not.toHaveProperty("email");
    expect(d.reponses[0]?.jour).toBe("2026-11-25");
  });

  it("une, deux dates, liste d'attente, puis annulation qui fait monter la personne suivante", async () => {
    const cap = CAPACITE_PAR_ATELIER as number;
    const r1 = (await enregistrerInscription(
      {
        ...personne(0, ["atelier-1", "atelier-2"]),
        siteWeb: "",
        jeton: await vieux("inscription"),
      },
      headers("10.0.0.0"),
      AVANT,
    )) as ResultatInscription;
    expect(r1.dates).toEqual([
      { atelier_id: "atelier-1", statut: "inscrit" },
      { atelier_id: "atelier-2", statut: "inscrit" },
    ]);
    for (let i = 1; i < cap; i++) {
      const r = await enregistrerInscription(
        { ...personne(i), siteWeb: "", jeton: await vieux("inscription") },
        headers(`10.0.0.${i}`),
        AVANT,
      );
      expect(r.ok).toBe(true);
    }
    const attente = (await enregistrerInscription(
      { ...personne(99), siteWeb: "", jeton: await vieux("inscription") },
      headers("10.0.1.1"),
      AVANT,
    )) as ResultatInscription;
    expect(attente.dates[0]?.statut).toBe("liste_attente");

    expect(await annulerInscription(r1.jeton)).toBe("ok");
    const d = await donneesAdmin(AVANT);
    const s = statsAteliers(d.inscriptions);
    expect(s.parAtelier[0]).toMatchObject({ inscrits: cap, attente: 0 });
    expect(s.aPrevenir.map((x) => x.personne.email)).toEqual(["p99@exemple.fr"]);
    expect(adressesInscrits(d.inscriptions, "atelier-1")).toContain("p99@exemple.fr");
    expect(adressesInscrits(d.inscriptions, "atelier-1")).not.toContain("p0@exemple.fr");
    expect(d.inscriptions).toHaveLength(cap + 1);
  });

  it("refuse une deuxième inscription avec le même email", async () => {
    await enregistrerInscription(
      { ...personne(1), siteWeb: "", jeton: await vieux("inscription") },
      headers("1.1.1.1"),
      AVANT,
    );
    const r = await enregistrerInscription(
      { ...personne(1), email: "P1@EXEMPLE.FR", siteWeb: "", jeton: await vieux("inscription") },
      headers("1.1.1.2"),
      AVANT,
    );
    expect(r).toMatchObject({ ok: false, erreurs: { email: expect.any(String) } });
  });

  it("le lendemain du jour J moins 3 à 0 h 00, le serveur refuse une inscription envoyée directement", async () => {
    const r = await enregistrerInscription(
      { ...personne(1), siteWeb: "", jeton: await vieux("inscription") },
      headers(),
      new Date("2026-12-12T00:00:00+01:00"),
    );
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/closes/) });
    expect((await donneesAdmin(AVANT)).inscriptions).toHaveLength(0);
  });

  it("après la clôture, la consultation refuse les réponses", async () => {
    const r = await enregistrerConsultation(
      { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
      headers(),
      new Date("2027-02-01T00:00:00+01:00"),
    );
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/close/) });
  });

  it("refuse un envoi en moins de 20 secondes et un envoi avec le champ piège rempli", async () => {
    const rapide = await enregistrerConsultation(
      {
        ...reponseValide,
        siteWeb: "",
        jeton: await creerJeton("consultation", Date.now() - 5_000),
      },
      headers(),
      AVANT,
    );
    expect(rapide).toMatchObject({ ok: false, message: expect.stringMatching(/vite/) });
    const piege = await enregistrerInscription(
      { ...personne(1), siteWeb: "https://spam.example", jeton: await vieux("inscription") },
      headers(),
      AVANT,
    );
    expect(piege.ok).toBe(false);
    const faux = await enregistrerConsultation(
      { ...reponseValide, siteWeb: "", jeton: "1700000000000.signature-inventee" },
      headers(),
      AVANT,
    );
    expect(faux.ok).toBe(false);
    const autreFormulaire = await enregistrerConsultation(
      { ...reponseValide, siteWeb: "", jeton: await vieux("inscription") },
      headers(),
      AVANT,
    );
    expect(autreFormulaire.ok).toBe(false);
    const d = await donneesAdmin(AVANT);
    expect(d.reponses).toHaveLength(0);
    expect(d.inscriptions).toHaveLength(0);
  });

  it("limite à 10 envois par heure et par adresse", async () => {
    for (let i = 0; i < 10; i++)
      expect(
        (
          await enregistrerConsultation(
            { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
            headers("198.51.100.1"),
            AVANT,
          )
        ).ok,
      ).toBe(true);
    expect(
      await enregistrerConsultation(
        { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
        headers("198.51.100.1"),
        AVANT,
      ),
    ).toMatchObject({ ok: false, message: expect.stringMatching(/une heure/) });
    expect(
      (
        await enregistrerConsultation(
          { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
          headers("198.51.100.2"),
          AVANT,
        )
      ).ok,
    ).toBe(true);
  });

  it("neutralise une saisie commençant par = dans les exports", async () => {
    await enregistrerConsultation(
      {
        ...reponseValide,
        mesureManquante: '=HYPERLINK("http://x")',
        siteWeb: "",
        jeton: await vieux("consultation"),
      },
      headers(),
      AVANT,
    );
    await enregistrerInscription(
      {
        ...personne(1),
        structure: "+33 attaque",
        nom: "@SUM(1)",
        siteWeb: "",
        jeton: await vieux("inscription"),
      },
      headers("2.2.2.2"),
      AVANT,
    );
    const d = await donneesAdmin(AVANT);
    expect(versCsv(tableauReponses(d.reponses, 5))).toContain(`"'=HYPERLINK(""http://x"")"`);
    const ateliers = versCsv(tableauInscriptions(d.inscriptions, "https://exemple.fr"));
    expect(ateliers).toContain(`"'@SUM(1)"`);
    expect(ateliers).toContain(`"'+33 attaque"`);
  });

  it("refuse une deuxième réponse depuis un navigateur qui a déjà répondu", async () => {
    const c = cookieParticipation(AVANT);
    expect(c.valeur).toBe("1");
    expect(c.options).toMatchObject({ httpOnly: true, path: "/" });
    expect(c.options.maxAge).toBeGreaterThan(14 * 86_400);
    const avecCookie = new Headers({
      "x-forwarded-for": "203.0.113.8",
      cookie: `autre=x; ${COOKIE_PARTICIPATION}=1`,
    });
    const r = await enregistrerConsultation(
      { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
      avecCookie,
      AVANT,
    );
    expect(r).toMatchObject({ ok: false, dejaRepondu: true });
    expect((await donneesAdmin(AVANT)).reponses).toHaveLength(0);
  });

  it("questionnaire v2 : enregistre les mesures non soutenues, refuse moins de 15 ans et « concernée » sans accord", async () => {
    const envoi = async (extra: Record<string, unknown>, ip: string) =>
      enregistrerConsultation(
        { ...reponseValide, ...extra, siteWeb: "", jeton: await vieux("consultation") },
        headers(ip),
        AVANT,
      );
    expect((await envoi({ age: "moins-15" }, "192.0.2.1")).ok).toBe(false);
    expect(await envoi({ lienSujet: ["concerne"] }, "192.0.2.2")).toMatchObject({
      ok: false,
      erreurs: { consentementConcerne: expect.any(String) },
    });
    expect((await donneesAdmin(AVANT)).reponses).toHaveLength(0);

    expect(
      (
        await envoi(
          { lienSujet: ["concerne"], consentementConcerne: true, mesuresRejetees: ["m02"] },
          "192.0.2.3",
        )
      ).ok,
    ).toBe(true);
    const [r] = (await donneesAdmin(AVANT)).reponses;
    expect(r).toMatchObject({
      version_questionnaire: "v2",
      lien_sujet: ["concerne"],
      mesures_rejetees: ["m02"],
      ordre_affichage: reponseValide.ordreAffichage,
    });
    expect(Object.keys(r!)).not.toContain("consentement_concerne");
  });

  it("compteur et rang : rien sous 100 réponses, puis le rang à la seule personne qui répond", async () => {
    const envoi = async (ip: string) =>
      enregistrerConsultation(
        { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
        headers(ip),
        AVANT,
      );
    expect(await envoi("192.0.2.10")).toEqual({ ok: true, rang: null });
    expect((await etatSite(AVANT)).compteur).toBeNull();
    const r = { ...reponseSqlServeur, version_questionnaire: "v2", ordre_affichage: [] };
    for (let i = 0; i < 98; i++) await rpc("enregistrer_reponse", { r });
    expect((await etatSite(AVANT)).compteur).toBeNull();
    expect(await envoi("192.0.2.11")).toEqual({ ok: true, rang: 100 });
    expect((await etatSite(AVANT)).compteur).toBe(100);
    for (let i = 0; i < 9; i++) await rpc("enregistrer_reponse", { r });
    expect((await etatSite(AVANT)).compteur).toBe(100);
    expect(await envoi("192.0.2.12")).toEqual({ ok: true, rang: 110 });
    expect((await etatSite(AVANT)).compteur).toBe(110);
  });

  it("garde les emails pour la suite à part, sans doublon et sans lien avec les réponses", async () => {
    await enregistrerConsultation(
      { ...reponseValide, siteWeb: "", jeton: await vieux("consultation") },
      headers(),
      AVANT,
    );
    const suite = async (email: string, jeton?: string) =>
      enregistrerContactSuite(
        { email, siteWeb: "", jeton: jeton ?? (await creerJeton("suite", Date.now() - 4_000)) },
        headers(),
        AVANT,
      );
    expect(await suite("Camille@Exemple.fr")).toEqual({ ok: true });
    expect(await suite("camille@exemple.fr ")).toEqual({ ok: true });
    expect(await suite("pas-un-email")).toMatchObject({
      ok: false,
      erreurs: { email: expect.any(String) },
    });
    expect(await suite("robot@exemple.fr", await creerJeton("suite", Date.now()))).toMatchObject({
      ok: false,
      message: expect.stringMatching(/vite/),
    });
    const d = await donneesAdmin(AVANT);
    expect(d.contactsSuite).toEqual([{ email: "camille@exemple.fr", jour: "2026-11-25" }]);
    expect(Object.keys(d.reponses[0]!)).not.toContain("email");
    expect(versCsv(tableauReponses(d.reponses, 5))).not.toContain("camille@exemple.fr");
    expect(versCsv(tableauContactsSuite(d.contactsSuite))).toContain("camille@exemple.fr");
  });
});
