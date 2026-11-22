import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AideCourte, Entete, Partage, PiedDePage, SuivreNosTravaux } from "@/components/site";
import { Marque } from "@/components/ui/trait";
import { CaseACocher, ChampPiege, ChoixMultiple, ResumeErreurs, Texte } from "@/components/champs";
import { ATELIERS_PAGE, DATE_LIMITE_INSCRIPTION, META, STRUCTURES } from "@/lib/contenus";
import {
  ATELIERS,
  CAPACITE_PAR_ATELIER,
  CONTACT_URL,
  dureeMinutes,
  formaterCreneau,
  formaterDuree,
  type AtelierId,
} from "@/lib/config";
import {
  erreursParChamp,
  inscriptionSchema,
  LIBELLES_INSCRIPTION,
  SITUATIONS_ATELIER,
} from "@/lib/formulaires";
import { genererIcs } from "@/lib/ics";
import { telecharger } from "@/lib/exports";
import { usePret } from "@/lib/use-pret";
import { getRequestOrigin } from "@/lib/origin.functions";
import { envoyerInscription, getEtatSite, getJetonFormulaire } from "@/lib/site.functions";
import { metaPage, urlAbsolue } from "@/lib/partage";
import type { Place, ResultatInscription } from "@/lib/server/services.server";

export const Route = createFileRoute("/ateliers")({
  loader: async () => {
    const [origine, etat] = await Promise.all([getRequestOrigin(), getEtatSite()]);
    return { origine, etat };
  },
  head: ({ loaderData }) => ({
    meta: metaPage({
      origine: loaderData?.origine,
      chemin: "/ateliers",
      titre: `${ATELIERS_PAGE.titre} · Présidentielle 2027`,
      description: META.ateliers,
    }),
    links: loaderData
      ? [{ rel: "canonical", href: urlAbsolue(loaderData.origine, "/ateliers") }]
      : [],
    // Données structurées des deux ateliers : dates de config.ts, aucun lien de visio, aucune disponibilité.
    scripts: loaderData
      ? ATELIERS.map((a) => ({
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: `Atelier ${a.numero} : ${a.titre}`,
            description: ATELIERS_PAGE.intro.join(" "),
            startDate: a.debut,
            endDate: a.fin,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
            location: {
              "@type": "VirtualLocation",
              url: urlAbsolue(loaderData.origine, "/ateliers"),
            },
            organizer: [STRUCTURES.ir, STRUCTURES.fai].map((s) => ({
              "@type": "Organization",
              name: s.nom,
              url: s.site,
            })),
            isAccessibleForFree: true,
            offers: {
              "@type": "Offer",
              price: 0,
              priceCurrency: "EUR",
              url: urlAbsolue(loaderData.origine, "/ateliers"),
            },
            inLanguage: "fr",
          }).replace(/</g, "\\u003c"),
        }))
      : [],
  }),
  component: PageAteliers,
});

const T = ATELIERS_PAGE;

/** Échéance soulignée du trait corail. */
function Echeance({ className = "" }: { className?: string }) {
  const [avant, apres] = T.ouvertes.split(DATE_LIMITE_INSCRIPTION);
  return (
    <p className={`echeance-date ${className}`}>
      {avant}
      <Marque geste="souligner">{DATE_LIMITE_INSCRIPTION}</Marque>
      {apres}
    </p>
  );
}

/** Description d'un atelier : créneau et format. Portée par la case à cocher quand les inscriptions sont ouvertes. */
function DescriptionAtelier({ atelier }: { atelier: (typeof ATELIERS)[number] }) {
  return (
    <>
      <span className="choix-titre">
        Atelier {atelier.numero} : {atelier.titre}
      </span>
      <span className="block">{formaterCreneau(atelier.debut, atelier.fin)}</span>
      <span className="choix-detail">
        En visio ({formaterDuree(dureeMinutes(atelier.debut, atelier.fin))})
      </span>
    </>
  );
}

function PageAteliers() {
  const { etat } = Route.useLoaderData();
  const [resultat, setResultat] = useState<ResultatInscription | null>(null);
  return (
    <>
      <Entete />
      <main id="contenu" className="section">
        {resultat ? (
          <div className="conteneur conteneur-etroit">
            <Confirmation resultat={resultat} consultationOuverte={!etat.consultationClose} />
          </div>
        ) : (
          <div className="conteneur grille-formulaire">
            <div className="colonne-reperes">
              {etat.inscriptionsOuvertes && <Echeance />}
              <AideCourte />
            </div>
            <div className="min-w-0">
              <header>
                <h1 className="titre-principal">{T.titre}</h1>
                <ul className="texte-long mt-4 flex flex-col gap-2">
                  {T.intro.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                {etat.inscriptionsOuvertes && <Echeance className="mt-5 lg:hidden" />}
              </header>
              {etat.inscriptionsOuvertes ? (
                <Formulaire places={etat.places} onInscrit={setResultat} />
              ) : (
                <div className="mt-8">
                  <ul className="etapes-liste">
                    {ATELIERS.map((a) => (
                      <li key={a.id} className="flex-col gap-0">
                        <DescriptionAtelier atelier={a} />
                      </li>
                    ))}
                  </ul>
                  <div className="carte mt-8" role="status">
                    <p className="font-titre text-lg font-semibold text-navy">{T.closes}</p>
                    {!etat.consultationClose && (
                      <Link to="/consultation" className="bouton bouton-plein mt-5">
                        {T.boutonConsultation}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <PiedDePage />
    </>
  );
}

type Saisie = {
  ateliers: AtelierId[];
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  situations: string[];
  situationAutre: string;
  structure: string;
  motivation: string;
  accessibilite: string;
  majeur: boolean;
  consentementOrganisation: boolean;
  actualitesIr: boolean;
  actualitesFai: boolean;
};
const VIDE: Saisie = {
  ateliers: [],
  prenom: "",
  nom: "",
  email: "",
  departement: "",
  situations: [],
  situationAutre: "",
  structure: "",
  motivation: "",
  accessibilite: "",
  majeur: false,
  consentementOrganisation: false,
  actualitesIr: false,
  actualitesFai: false,
};

function Formulaire({
  places,
  onInscrit,
}: {
  places: Place[];
  onInscrit: (r: ResultatInscription) => void;
}) {
  const obtenirJeton = useServerFn(getJetonFormulaire);
  const envoyer = useServerFn(envoyerInscription);
  const pret = usePret();
  const [s, setS] = useState<Saisie>(VIDE);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [piege, setPiege] = useState("");
  const jeton = useRef("");
  const resume = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    void obtenirJeton({ data: { formulaire: "inscription" } }).then((j) => {
      jeton.current = j;
    });
  }, [obtenirJeton]);

  const maj =
    <K extends keyof Saisie>(cle: K) =>
    (v: Saisie[K]) => {
      setS((x) => ({ ...x, [cle]: v }));
      setErreurs((e) => {
        if (!e[cle]) return e;
        const { [cle]: _, ...reste } = e;
        return reste;
      });
    };
  const montrer = (e: Record<string, string>, msg: string) => {
    setErreurs(e);
    setMessage(msg);
    requestAnimationFrame(() => resume.current?.focus());
  };

  const soumettre = async () => {
    const v = inscriptionSchema.safeParse(s);
    if (!v.success) return montrer(erreursParChamp(v.error), "Certains champs sont à vérifier.");
    setEnvoi(true);
    setMessage("");
    try {
      const r = await envoyer({ data: { ...s, siteWeb: piege, jeton: jeton.current } });
      if (r.ok) {
        onInscrit(r);
        window.scrollTo({ top: 0 });
        return;
      }
      montrer(r.erreurs ?? {}, r.message);
    } catch {
      montrer({}, "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form
      noValidate
      method="post"
      className="mt-10"
      onSubmit={(e) => {
        e.preventDefault();
        void soumettre();
      }}
      aria-labelledby="form-titre"
    >
      <h2 id="form-titre" className="titre-section">
        Je m'inscris
      </h2>
      <p className="aide mt-2">Les ateliers sont ouverts aux personnes de 18 ans et plus.</p>
      <ChampPiege valeur={piege} onChange={setPiege} />
      {message && (
        <div className="mt-4">
          <ResumeErreurs
            message={message}
            erreurs={erreurs}
            libelles={LIBELLES_INSCRIPTION}
            refFocus={(el) => {
              resume.current = el;
            }}
          />
        </div>
      )}

      <div className="pile mt-6">
        <fieldset
          id="champ-ateliers"
          aria-describedby={erreurs["ateliers"] ? "ateliers-erreur" : undefined}
          aria-invalid={erreurs["ateliers"] ? true : undefined}
        >
          <legend>
            {LIBELLES_INSCRIPTION.ateliers} <span className="aide font-normal">(obligatoire)</span>
          </legend>
          <div className="choix-liste deux-colonnes">
            {ATELIERS.map((a) => {
              const p = places.find((x) => x.atelier_id === a.id);
              const complet = p?.restantes === 0;
              return (
                <label key={a.id} className="choix">
                  <input
                    type="checkbox"
                    checked={s.ateliers.includes(a.id)}
                    onChange={(e) =>
                      maj("ateliers")(
                        e.target.checked
                          ? [...s.ateliers, a.id]
                          : s.ateliers.filter((x) => x !== a.id),
                      )
                    }
                  />
                  <span>
                    <DescriptionAtelier atelier={a} />
                    {CAPACITE_PAR_ATELIER !== "illimité" && p && (
                      <span className={`badge mt-2 ${complet ? "badge-attente" : ""}`}>
                        {complet ? T.complet : T.placesRestantes(p.restantes ?? 0)}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {erreurs["ateliers"] && (
            <p id="ateliers-erreur" className="erreur mt-2" role="alert">
              {erreurs["ateliers"]}
            </p>
          )}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Texte
            nom="prenom"
            libelle={LIBELLES_INSCRIPTION.prenom}
            valeur={s.prenom}
            onChange={maj("prenom")}
            erreur={erreurs["prenom"]}
            autoComplete="given-name"
            max={100}
          />
          <Texte
            nom="nom"
            libelle={LIBELLES_INSCRIPTION.nom}
            valeur={s.nom}
            onChange={maj("nom")}
            erreur={erreurs["nom"]}
            autoComplete="family-name"
            max={100}
          />
        </div>
        <Texte
          nom="email"
          type="email"
          libelle={LIBELLES_INSCRIPTION.email}
          valeur={s.email}
          onChange={maj("email")}
          erreur={erreurs["email"]}
          autoComplete="email"
          max={254}
          aide="Pour vous envoyer le lien de la visio."
        />
        <Texte
          nom="departement"
          libelle={LIBELLES_INSCRIPTION.departement}
          valeur={s.departement}
          onChange={maj("departement")}
          facultatif
          max={60}
        />
        <ChoixMultiple
          nom="situations"
          libelle={LIBELLES_INSCRIPTION.situations}
          aide="Plusieurs choix possibles"
          options={SITUATIONS_ATELIER}
          valeurs={s.situations}
          onChange={maj("situations")}
          facultatif
          colonnes
          apres={
            s.situations.includes("autre") ? (
              <div className="mt-4">
                <Texte
                  nom="situationAutre"
                  libelle={LIBELLES_INSCRIPTION.situationAutre}
                  valeur={s.situationAutre}
                  onChange={maj("situationAutre")}
                  erreur={erreurs["situationAutre"]}
                  max={200}
                />
              </div>
            ) : null
          }
        />
        <Texte
          nom="structure"
          libelle={LIBELLES_INSCRIPTION.structure}
          valeur={s.structure}
          onChange={maj("structure")}
          facultatif
          max={200}
          autoComplete="organization"
        />
        <Texte
          nom="motivation"
          libelle={LIBELLES_INSCRIPTION.motivation}
          valeur={s.motivation}
          onChange={maj("motivation")}
          erreur={erreurs["motivation"]}
          facultatif
          multiligne
          max={1000}
          apres={<p className="encart mt-2">{T.concerne}</p>}
        />
        <Texte
          nom="accessibilite"
          libelle={LIBELLES_INSCRIPTION.accessibilite}
          valeur={s.accessibilite}
          onChange={maj("accessibilite")}
          facultatif
          multiligne
          max={500}
          aide="Sous titres, interprétation en langue des signes, pauses ou autre besoin."
        />

        <div className="flex flex-col gap-3">
          <CaseACocher
            nom="majeur"
            libelle={LIBELLES_INSCRIPTION.majeur}
            coche={s.majeur}
            onChange={maj("majeur")}
            erreur={erreurs["majeur"]}
            obligatoire
          />
          <CaseACocher
            nom="consentementOrganisation"
            libelle={LIBELLES_INSCRIPTION.consentementOrganisation}
            coche={s.consentementOrganisation}
            onChange={maj("consentementOrganisation")}
            erreur={erreurs["consentementOrganisation"]}
            obligatoire
          />
          <CaseACocher
            nom="actualitesIr"
            libelle={LIBELLES_INSCRIPTION.actualitesIr}
            coche={s.actualitesIr}
            onChange={maj("actualitesIr")}
          />
          <CaseACocher
            nom="actualitesFai"
            libelle={LIBELLES_INSCRIPTION.actualitesFai}
            coche={s.actualitesFai}
            onChange={maj("actualitesFai")}
          />
          <p className="aide">
            Vos données servent uniquement à l'Institut Rousseau et à Face à l'inceste.{" "}
            <Link to="/donnees-personnelles">En savoir plus sur vos données</Link>
          </p>
        </div>

        <AideCourte className="lg:hidden" />

        <button
          type="submit"
          className="bouton bouton-plein w-full sm:w-auto"
          disabled={envoi || !pret}
          aria-busy={envoi}
        >
          {envoi ? T.envoi : T.bouton}
        </button>
      </div>
    </form>
  );
}

function Confirmation({
  resultat,
  consultationOuverte,
}: {
  resultat: ResultatInscription;
  consultationOuverte: boolean;
}) {
  const [copie, setCopie] = useState(false);
  const [lien, setLien] = useState("");
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setLien(`${window.location.origin}/annuler/${resultat.jeton}`);
    titre.current?.focus();
  }, [resultat.jeton]);
  const choisis = resultat.dates.map((d) => ({
    ...d,
    atelier: ATELIERS.find((a) => a.id === d.atelier_id)!,
  }));
  const agenda = () => {
    for (const c of choisis) {
      const ics = genererIcs({
        atelier: c.atelier,
        lienAnnulation: lien,
        contact: CONTACT_URL,
        listeAttente: c.statut === "liste_attente",
      });
      telecharger(
        ics,
        "text/calendar;charset=utf-8",
        `atelier-${c.atelier.numero}-enfance-2027.ics`,
      );
    }
  };
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 ref={titre} tabIndex={-1} className="titre-principal outline-none">
          {T.merci}
        </h1>
        <ul className="etapes-liste mt-6">
          {choisis.map((c) => (
            <li key={c.atelier_id} className="flex-col gap-0 text-encre">
              <strong className="text-navy">
                Atelier {c.atelier.numero} : {c.atelier.titre}
              </strong>
              {formaterCreneau(c.atelier.debut, c.atelier.fin)}
              {c.statut === "liste_attente" && (
                <span className="badge badge-attente mt-2 block w-fit">
                  Liste d'attente. Nous vous écrirons si une place se libère.
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-5 texte-long">{T.visio}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            className="bouton bouton-plein w-full sm:w-auto"
            onClick={agenda}
            disabled={!lien}
          >
            {T.agenda}
          </button>
          <p className="mention">{T.agendaAide}</p>
        </div>
        <div className="mt-6">
          <label htmlFor="lien-annulation" className="etiquette">
            {T.lienAnnulation}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="lien-annulation"
              className="saisie"
              readOnly
              value={lien}
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="bouton bouton-contour flex-none"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lien);
                  setCopie(true);
                  setTimeout(() => setCopie(false), 2500);
                } catch {
                  /* le lien reste sélectionnable */
                }
              }}
            >
              {copie ? T.copie : T.copier}
            </button>
          </div>
          <p className="sr-only" role="status">
            {copie ? T.copie : ""}
          </p>
        </div>
      </div>
      {consultationOuverte && (
        <section className="carte" aria-labelledby="rebond">
          <h2 id="rebond" className="titre-bloc">
            {T.rebond}
          </h2>
          <Link to="/consultation" className="bouton bouton-plein mt-4">
            {T.boutonConsultation}
          </Link>
        </section>
      )}
      <SuivreNosTravaux />
      <Partage />
    </div>
  );
}
