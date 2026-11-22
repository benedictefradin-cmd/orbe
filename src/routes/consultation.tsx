import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { BesoinDeParler, Entete, Partage, PiedDePage, SuivreNosTravaux } from "@/components/site";
import { ChampPiege, ChoixMultiple, ChoixUnique, ResumeErreurs, Texte } from "@/components/champs";
import { Classement } from "@/components/classement";
import { CONSULTATION, CRENEAU_1, CRENEAU_2, DATE_LIMITE_INSCRIPTION, SITE } from "@/lib/contenus";
import { ATELIERS } from "@/lib/config";
import {
  classementSchema,
  erreursParChamp,
  libelle,
  pourAllerPlusLoinSchema,
  profilSchema,
  Q,
} from "@/lib/formulaires";
import { melanger, MESURE_IDS, mesureParId } from "@/lib/mesures";
import { getRequestOrigin } from "@/lib/origin.functions";
import {
  envoyerConsultation,
  envoyerContactSuite,
  getDejaRepondu,
  getEtatSite,
  getJetonFormulaire,
} from "@/lib/site.functions";
import { metaPage } from "@/lib/partage";
import { usePret } from "@/lib/use-pret";

export const Route = createFileRoute("/consultation")({
  loader: async () => {
    const [origine, etat, dejaRepondu] = await Promise.all([
      getRequestOrigin(),
      getEtatSite(),
      getDejaRepondu(),
    ]);
    return { origine, etat, dejaRepondu };
  },
  head: ({ loaderData }) => ({
    meta: metaPage({
      origine: loaderData?.origine,
      chemin: "/consultation",
      titre: `${CONSULTATION.titre} · Présidentielle 2027`,
      description: SITE.description,
    }),
  }),
  component: PageConsultation,
});

type Donnees = {
  age: string | null;
  genre: string | null;
  region: string | null;
  lieuVie: string | null;
  situation: string | null;
  parent: string | null;
  liensEnfance: string[];
  lienSujet: string[];
  classement: string[];
  mesureManquante: string;
  presenceDebat: string | null;
  poidsVote: string | null;
  provenance: string | null;
};
const VIDE: Donnees = {
  age: null,
  genre: null,
  region: null,
  lieuVie: null,
  situation: null,
  parent: null,
  liensEnfance: [],
  lienSujet: [],
  classement: [],
  mesureManquante: "",
  presenceDebat: null,
  poidsVote: null,
  provenance: null,
};
const SCHEMAS = [profilSchema, classementSchema, pourAllerPlusLoinSchema] as const;
const CHAMPS_ETAPE: (keyof Donnees)[][] = [
  ["age", "genre", "region", "lieuVie", "situation", "parent", "liensEnfance", "lienSujet"],
  ["classement"],
  ["mesureManquante", "presenceDebat", "poidsVote", "provenance"],
];
const LIBELLES: Record<string, string> = {
  age: Q.age.libelle,
  genre: Q.genre.libelle,
  region: Q.region.libelle,
  lieuVie: Q.lieuVie.libelle,
  situation: Q.situation.libelle,
  parent: Q.parent.libelle,
  liensEnfance: "Lien avec l'enfance",
  lienSujet: Q.lienSujet.libelle,
  classement: "Vos priorités",
  mesureManquante: Q.mesureManquante.libelle,
};

function PageConsultation() {
  const { etat, dejaRepondu } = Route.useLoaderData();
  const [envoye, setEnvoye] = useState(false);
  const [refuse, setRefuse] = useState(false);
  return (
    <>
      <Entete />
      <main id="contenu" className="section pt-10">
        <div className="conteneur conteneur-etroit">
          {etat.consultationClose ? (
            <div className="carte">
              <h1 className="titre-section">{CONSULTATION.titre}</h1>
              <p className="texte-long mt-4" role="status">
                {CONSULTATION.close}
              </p>
              <Link to="/" className="bouton bouton-contour mt-6">
                Retour à l'accueil
              </Link>
            </div>
          ) : envoye ? (
            <Merci inscriptionsOuvertes={etat.inscriptionsOuvertes} />
          ) : dejaRepondu || refuse ? (
            <DejaRepondu />
          ) : (
            <Formulaire onEnvoye={() => setEnvoye(true)} onDejaRepondu={() => setRefuse(true)} />
          )}
        </div>
      </main>
      <PiedDePage />
    </>
  );
}

function Formulaire({
  onEnvoye,
  onDejaRepondu,
}: {
  onEnvoye: () => void;
  onDejaRepondu: () => void;
}) {
  const obtenirJeton = useServerFn(getJetonFormulaire);
  const envoyer = useServerFn(envoyerConsultation);
  const pret = usePret();
  const [etape, setEtape] = useState(0);
  const [d, setD] = useState<Donnees>(VIDE);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [piege, setPiege] = useState("");
  // Ordre des 24 mesures tiré une seule fois par visite, côté navigateur, et gardé au retour sur l'étape.
  const [ordre, setOrdre] = useState<string[] | null>(null);
  const jeton = useRef<string>("");
  const titreEtape = useRef<HTMLHeadingElement>(null);
  const resume = useRef<HTMLDivElement | null>(null);
  const premierRendu = useRef(true);

  useEffect(() => {
    void obtenirJeton({ data: { formulaire: "consultation" } }).then((j) => {
      jeton.current = j;
    });
  }, [obtenirJeton]);
  useEffect(() => {
    setOrdre(melanger(MESURE_IDS));
  }, []);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    titreEtape.current?.focus();
    window.scrollTo({ top: 0 });
  }, [etape]);

  const maj =
    <K extends keyof Donnees>(cle: K) =>
    (v: Donnees[K]) => {
      setD((x) => ({ ...x, [cle]: v }));
      setErreurs((e) => {
        if (!e[cle]) return e;
        const { [cle]: _, ...reste } = e;
        return reste;
      });
    };

  const montrerErreurs = (e: Record<string, string>, msg: string) => {
    setErreurs(e);
    setMessage(msg);
    requestAnimationFrame(() => resume.current?.focus());
  };

  const suivant = () => {
    const schema = SCHEMAS[etape as 0 | 1 | 2];
    const v = schema.safeParse(d);
    if (!v.success)
      return montrerErreurs(erreursParChamp(v.error), "Certaines réponses sont à compléter.");
    setErreurs({});
    setMessage("");
    setEtape(etape + 1);
  };

  const valider = async () => {
    setEnvoi(true);
    setMessage("");
    try {
      const r = await envoyer({
        data: { ...d, ordreAffichage: ordre ?? [], siteWeb: piege, jeton: jeton.current },
      });
      if (r.ok) return onEnvoye();
      if ("dejaRepondu" in r && r.dejaRepondu) return onDejaRepondu();
      const e = r.erreurs ?? {};
      const etapeErreur = CHAMPS_ETAPE.findIndex((champs) => champs.some((c) => e[c]));
      if (etapeErreur >= 0) setEtape(etapeErreur);
      montrerErreurs(e, r.message);
    } catch {
      montrerErreurs(
        {},
        "L'enregistrement n'a pas fonctionné. Vos réponses sont toujours là. Réessayez dans un instant.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  const total = CONSULTATION.etapes.length;
  return (
    <div>
      {etape === 0 && (
        <header className="mb-8">
          <h1 className="titre-section">{CONSULTATION.titre}</h1>
          <ul className="texte-long mt-4 flex list-disc flex-col gap-1 pl-5">
            {CONSULTATION.recap.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-4 font-titre text-xl text-primaire">{CONSULTATION.accroche}</p>
          <p className="mt-4 rounded-lg bg-accent-pale p-4 font-semibold">
            {CONSULTATION.anonymat}
          </p>
        </header>
      )}

      <div className="mb-6">
        <p className="mention" id="progression-libelle">
          Étape {etape + 1} sur {total}, {CONSULTATION.etapes[etape]}
        </p>
        <div
          className="progression mt-2"
          role="progressbar"
          aria-labelledby="progression-libelle"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={etape + 1}
        >
          <div style={{ width: `${((etape + 1) / total) * 100}%` }} />
        </div>
      </div>

      <form
        noValidate
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (etape < 3) suivant();
          else void valider();
        }}
      >
        <ChampPiege valeur={piege} onChange={setPiege} />
        <h2 ref={titreEtape} tabIndex={-1} className="text-3xl outline-none">
          {CONSULTATION.etapes[etape]}
        </h2>
        {message && (
          <div className="mt-4">
            <ResumeErreurs
              message={message}
              erreurs={erreurs}
              libelles={LIBELLES}
              refFocus={(el) => {
                resume.current = el;
              }}
            />
          </div>
        )}

        <div key={etape} className="etape-contenu mt-6">
          {etape === 0 && (
            <div className="pile">
              <p className="aide">{CONSULTATION.profilIntro}</p>
              <ChoixUnique
                nom="age"
                libelle={Q.age.libelle}
                options={Q.age.options}
                valeur={d.age}
                onChange={maj("age")}
                erreur={erreurs["age"]}
                nsp
                colonnes
              />
              <ChoixUnique
                nom="genre"
                libelle={Q.genre.libelle}
                options={Q.genre.options}
                valeur={d.genre}
                onChange={maj("genre")}
                erreur={erreurs["genre"]}
                nsp
                colonnes
              />
              <div className="champ">
                <label htmlFor="champ-region" className="etiquette">
                  {Q.region.libelle}
                </label>
                <select
                  id="champ-region"
                  className="saisie"
                  value={d.region ?? ""}
                  onChange={(e) => maj("region")(e.target.value || null)}
                  aria-invalid={erreurs["region"] ? true : undefined}
                  aria-describedby={erreurs["region"] ? "region-erreur" : undefined}
                >
                  <option value="">Choisissez votre région</option>
                  {Q.region.options.map((o) => (
                    <option key={o.valeur} value={o.valeur}>
                      {o.libelle}
                    </option>
                  ))}
                  <option value="nsp">Je préfère ne pas répondre</option>
                </select>
                {erreurs["region"] && (
                  <p id="region-erreur" className="erreur" role="alert">
                    {erreurs["region"]}
                  </p>
                )}
              </div>
              <ChoixUnique
                nom="lieuVie"
                libelle={Q.lieuVie.libelle}
                options={Q.lieuVie.options}
                valeur={d.lieuVie}
                onChange={maj("lieuVie")}
                erreur={erreurs["lieuVie"]}
                nsp
              />
              <ChoixUnique
                nom="situation"
                libelle={Q.situation.libelle}
                options={Q.situation.options}
                valeur={d.situation}
                onChange={maj("situation")}
                erreur={erreurs["situation"]}
                nsp
                colonnes
              />
              <ChoixUnique
                nom="parent"
                libelle={Q.parent.libelle}
                options={Q.parent.options}
                valeur={d.parent}
                onChange={maj("parent")}
                erreur={erreurs["parent"]}
                nsp
                colonnes
              />
              <ChoixMultiple
                nom="liensEnfance"
                libelle={Q.liensEnfance.libelle}
                aide={Q.liensEnfance.aide}
                options={Q.liensEnfance.options}
                valeurs={d.liensEnfance}
                onChange={maj("liensEnfance")}
                erreur={erreurs["liensEnfance"]}
                nsp
                colonnes
              />
              <ChoixMultiple
                nom="lienSujet"
                libelle={Q.lienSujet.libelle}
                aide={Q.lienSujet.aide}
                options={Q.lienSujet.options}
                valeurs={d.lienSujet}
                onChange={(v) =>
                  maj("lienSujet")(
                    v.includes("aucun") && !d.lienSujet.includes("aucun")
                      ? ["aucun"]
                      : v.filter((x) => x !== "aucun" || v.length === 1),
                  )
                }
                erreur={erreurs["lienSujet"]}
                apres={
                  <div className="mt-4">
                    <BesoinDeParler compact id="aide-profil" />
                  </div>
                }
              />
            </div>
          )}

          {etape === 1 && (
            <Classement
              ordre={ordre}
              valeur={d.classement}
              onChange={maj("classement")}
              erreur={erreurs["classement"]}
            />
          )}

          {etape === 2 && (
            <div className="pile">
              <p className="aide">{CONSULTATION.plusLoinIntro}</p>
              <Texte
                nom="mesureManquante"
                libelle={Q.mesureManquante.libelle}
                aide={Q.mesureManquante.aide}
                valeur={d.mesureManquante}
                onChange={maj("mesureManquante")}
                erreur={erreurs["mesureManquante"]}
                facultatif
                multiligne
                max={Q.mesureManquante.max}
              />
              <ChoixUnique
                nom="presenceDebat"
                libelle={Q.presenceDebat.libelle}
                options={Q.presenceDebat.options}
                valeur={d.presenceDebat}
                onChange={maj("presenceDebat")}
                facultatif
                colonnes
              />
              <ChoixUnique
                nom="poidsVote"
                libelle={Q.poidsVote.libelle}
                options={Q.poidsVote.options}
                valeur={d.poidsVote}
                onChange={maj("poidsVote")}
                facultatif
                colonnes
              />
              <ChoixUnique
                nom="provenance"
                libelle={Q.provenance.libelle}
                options={Q.provenance.options}
                valeur={d.provenance}
                onChange={maj("provenance")}
                facultatif
              />
            </div>
          )}

          {etape === 3 && <Recapitulatif d={d} allerA={setEtape} />}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {etape > 0 ? (
            <button
              type="button"
              className="bouton bouton-contour"
              onClick={() => {
                setErreurs({});
                setMessage("");
                setEtape(etape - 1);
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              {CONSULTATION.retour}
            </button>
          ) : (
            <span />
          )}
          {etape < 3 ? (
            <button type="submit" className="bouton bouton-plein" disabled={!pret}>
              {CONSULTATION.suivant}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="bouton bouton-plein"
              disabled={envoi || !pret}
              aria-busy={envoi}
            >
              {envoi ? CONSULTATION.envoi : CONSULTATION.valider}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Ligne({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-bordure py-3 sm:flex-row sm:gap-4">
      <dt className="font-semibold sm:w-2/5">{titre}</dt>
      <dd className="m-0 sm:w-3/5">{valeur || "Pas de réponse"}</dd>
    </div>
  );
}

function Recapitulatif({ d, allerA }: { d: Donnees; allerA: (n: number) => void }) {
  const liste = (o: typeof Q.liensEnfance.options | typeof Q.lienSujet.options, v: string[]) =>
    v.map((x) => libelle(o, x)).join(", ");
  return (
    <div>
      <p className="aide">{CONSULTATION.recapIntro}</p>
      <section className="mt-6" aria-labelledby="recap-profil">
        <div className="flex items-center justify-between gap-2">
          <h3 id="recap-profil" className="font-sans text-lg font-bold">
            {CONSULTATION.etapes[0]}
          </h3>
          <button
            type="button"
            className="bouton bouton-discret bouton-petit"
            onClick={() => allerA(0)}
          >
            Modifier<span className="sr-only"> votre profil</span>
          </button>
        </div>
        <dl className="mt-2">
          <Ligne titre={Q.age.libelle} valeur={libelle(Q.age.options, d.age)} />
          <Ligne titre={Q.genre.libelle} valeur={libelle(Q.genre.options, d.genre)} />
          <Ligne titre={Q.region.libelle} valeur={libelle(Q.region.options, d.region)} />
          <Ligne titre={Q.lieuVie.libelle} valeur={libelle(Q.lieuVie.options, d.lieuVie)} />
          <Ligne titre={Q.situation.libelle} valeur={libelle(Q.situation.options, d.situation)} />
          <Ligne
            titre="Parent ou responsable d'un enfant mineur"
            valeur={libelle(Q.parent.options, d.parent)}
          />
          <Ligne
            titre="Lien avec l'enfance"
            valeur={liste(Q.liensEnfance.options, d.liensEnfance)}
          />
          <Ligne titre={Q.lienSujet.libelle} valeur={liste(Q.lienSujet.options, d.lienSujet)} />
        </dl>
      </section>
      <section className="mt-8" aria-labelledby="recap-priorites">
        <div className="flex items-center justify-between gap-2">
          <h3 id="recap-priorites" className="font-sans text-lg font-bold">
            {CONSULTATION.etapes[1]}
          </h3>
          <button
            type="button"
            className="bouton bouton-discret bouton-petit"
            onClick={() => allerA(1)}
          >
            Modifier<span className="sr-only"> vos priorités</span>
          </button>
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {d.classement.map((id, i) => (
            <li key={id} className="flex gap-3">
              <span className="rang" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <span className="sr-only">{i + 1}, </span>
                {mesureParId(id)?.texte}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-8" aria-labelledby="recap-plus">
        <div className="flex items-center justify-between gap-2">
          <h3 id="recap-plus" className="font-sans text-lg font-bold">
            {CONSULTATION.etapes[2]}
          </h3>
          <button
            type="button"
            className="bouton bouton-discret bouton-petit"
            onClick={() => allerA(2)}
          >
            Modifier<span className="sr-only"> vos réponses facultatives</span>
          </button>
        </div>
        <dl className="mt-2">
          <Ligne titre={Q.mesureManquante.libelle} valeur={d.mesureManquante} />
          <Ligne
            titre={Q.presenceDebat.libelle}
            valeur={libelle(Q.presenceDebat.options, d.presenceDebat)}
          />
          <Ligne titre={Q.poidsVote.libelle} valeur={libelle(Q.poidsVote.options, d.poidsVote)} />
          <Ligne
            titre={Q.provenance.libelle}
            valeur={libelle(Q.provenance.options, d.provenance)}
          />
        </dl>
      </section>
    </div>
  );
}

function Merci({ inscriptionsOuvertes }: { inscriptionsOuvertes: boolean }) {
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titre.current?.focus();
    window.scrollTo({ top: 0 });
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <div className="carte carte-accent">
        <CheckCircle2 size={40} className="text-accent" aria-hidden="true" />
        <h1 ref={titre} tabIndex={-1} className="titre-section mt-3 outline-none">
          {CONSULTATION.merci}
        </h1>
      </div>
      {inscriptionsOuvertes && (
        <section className="carte" aria-labelledby="rebond-titre">
          <h2 id="rebond-titre" className="text-2xl">
            {CONSULTATION.rebondTitre}
          </h2>
          <ul className="mt-4 flex flex-col gap-1">
            <li>
              Atelier 1, {ATELIERS[0].titre}, {CRENEAU_1}
            </li>
            <li>
              Atelier 2, {ATELIERS[1].titre}, {CRENEAU_2}
            </li>
          </ul>
          <p className="mention mt-3">Inscriptions jusqu'au {DATE_LIMITE_INSCRIPTION} inclus</p>
          <Link to="/ateliers" className="bouton bouton-plein mt-5">
            {CONSULTATION.rebondBouton}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      )}
      <ConnaitreLaSuite />
      <SuivreNosTravaux />
      <Partage />
    </div>
  );
}

function DejaRepondu() {
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titre.current?.focus();
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <div className="carte">
        <h1 ref={titre} tabIndex={-1} className="titre-section outline-none">
          {CONSULTATION.dejaRepondu.titre}
        </h1>
        <p className="texte-long mt-4" role="status">
          {CONSULTATION.dejaRepondu.texte}
        </p>
      </div>
      <ConnaitreLaSuite />
      <Partage />
    </div>
  );
}

/** Email facultatif pour connaître la suite. Envoyé à part, jamais avec les réponses. */
function ConnaitreLaSuite() {
  const obtenirJeton = useServerFn(getJetonFormulaire);
  const envoyer = useServerFn(envoyerContactSuite);
  const pret = usePret();
  const [email, setEmail] = useState("");
  const [piege, setPiege] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [fait, setFait] = useState(false);
  const jeton = useRef("");
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void obtenirJeton({ data: { formulaire: "suite" } }).then((j) => {
      jeton.current = j;
    });
  }, [obtenirJeton]);

  const valider = async () => {
    setEnvoi(true);
    setErreur("");
    try {
      const r = await envoyer({ data: { email, siteWeb: piege, jeton: jeton.current } });
      if (r.ok) return setFait(true);
      setErreur(r.erreurs?.["email"] ?? r.message);
    } catch {
      setErreur("L'enregistrement n'a pas fonctionné. Réessayez dans un instant.");
    } finally {
      setEnvoi(false);
    }
    requestAnimationFrame(() => champ.current?.focus());
  };

  return (
    <section className="carte" aria-labelledby="suite-titre">
      <h2 id="suite-titre" className="text-2xl">
        {CONSULTATION.suite.titre}
      </h2>
      <p className="texte-long mt-3">{CONSULTATION.suite.texte}</p>
      {fait ? (
        <p className="mt-4 flex items-center gap-2 font-semibold" role="status">
          <CheckCircle2 size={20} className="text-accent" aria-hidden="true" />
          {CONSULTATION.suite.merci}
        </p>
      ) : (
        <form
          noValidate
          method="post"
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void valider();
          }}
        >
          <ChampPiege valeur={piege} onChange={setPiege} />
          <div className="champ">
            <label htmlFor="champ-email-suite" className="etiquette">
              {CONSULTATION.suite.libelle}
            </label>
            <input
              ref={champ}
              id="champ-email-suite"
              name="email"
              type="email"
              autoComplete="email"
              className="saisie"
              value={email}
              maxLength={254}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreur("");
              }}
              aria-invalid={erreur ? true : undefined}
              aria-describedby={erreur ? "suite-separe suite-erreur" : "suite-separe"}
            />
            <p id="suite-separe" className="aide">
              {CONSULTATION.suite.separe}
            </p>
            {erreur && (
              <p id="suite-erreur" className="erreur" role="alert">
                {erreur}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bouton bouton-plein self-start"
            disabled={envoi || !pret}
            aria-busy={envoi}
          >
            {envoi ? CONSULTATION.suite.envoi : CONSULTATION.suite.bouton}
          </button>
        </form>
      )}
    </section>
  );
}
