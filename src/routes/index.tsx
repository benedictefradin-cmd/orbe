import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Entete, PiedDePage } from "@/components/site";
import { ACCUEIL, META } from "@/lib/contenus";
import { FERMETURE_INSCRIPTIONS } from "@/lib/config";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getEtatSite } from "@/lib/site.functions";
import { metaPage, urlAbsolue } from "@/lib/partage";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [origine, etat] = await Promise.all([getRequestOrigin(), getEtatSite()]);
    return { origine, etat };
  },
  head: ({ loaderData }) => ({
    meta: metaPage({ origine: loaderData?.origine, chemin: "/", description: META.accueil }),
    links: loaderData ? [{ rel: "canonical", href: urlAbsolue(loaderData.origine, "/") }] : [],
  }),
  component: Accueil,
});

/** Jours restants avant la clôture, calculés sur l'heure du serveur pour un rendu stable. */
function joursRestants(maintenant: string) {
  return Math.ceil(
    (FERMETURE_INSCRIPTIONS.getTime() - new Date(maintenant).getTime()) / 86_400_000,
  );
}

/** Entoure chaque passage à mettre en valeur d'un soulignement animé. */
function souligner(texte: string, passages: readonly string[]): ReactNode[] {
  const motif = new RegExp(`(${passages.join("|")})`);
  return texte.split(motif).map((morceau, i) =>
    passages.includes(morceau) ? (
      <span key={i} className="souligne" style={{ "--i": i } as CSSProperties}>
        {morceau}
      </span>
    ) : (
      morceau
    ),
  );
}

/** Accueil volontairement courte, trois entrées vers les pages dédiées. */
function Accueil() {
  const { etat } = Route.useLoaderData();
  const consultationOuverte = !etat.consultationClose;
  const ateliersOuverts = etat.inscriptionsOuvertes;
  const { contexte, consultation, ateliers } = ACCUEIL.entrees;
  const restant = ACCUEIL.restant(joursRestants(etat.maintenant));

  return (
    <>
      <Entete />
      <main id="contenu">
        <section className="section section-accueil" aria-labelledby="titre-principal">
          <div className="conteneur">
            <div className="max-w-3xl">
              <p className="surtitre">{ACCUEIL.surtitre}</p>
              <h1 id="titre-principal" className="titre-principal titre-accueil mt-3">
                {souligner(ACCUEIL.titre, ACCUEIL.titreSouligne)}
              </h1>
              <p className="accroche-accueil mt-5">{ACCUEIL.accroche}</p>
              <p className="intro-accueil mt-2 text-secondaire">{ACCUEIL.intro}</p>
              <p className="accroche-accueil mt-3">{ACCUEIL.appel}</p>
            </div>

            {(consultationOuverte || ateliersOuverts) && (
              <p className="cloture mt-10">
                {restant && <span className="cloture-compte">{restant}</span>}
                <span>{ACCUEIL.cloture}</span>
              </p>
            )}

            <ul className="entrees mt-4">
              <Entree ton="ciel" titre={contexte.titre} chemin="/contexte" />

              <Entree
                ton="nuit"
                titre={consultationOuverte ? consultation.titre : consultation.titreClos}
                chemin={consultationOuverte ? "/consultation" : undefined}
              >
                {!consultationOuverte && (
                  <p className="font-semibold" role="status">
                    {consultation.close}
                  </p>
                )}
              </Entree>

              <Entree
                ton="roi"
                titre={ateliersOuverts ? ateliers.titre : ateliers.titreClos}
                chemin={ateliersOuverts ? "/ateliers" : undefined}
              >
                {!ateliersOuverts && (
                  <p className="badge badge-annule self-start text-base">{ateliers.clos}</p>
                )}
              </Entree>
            </ul>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}

/** Carte d'entrée, entièrement cliquable quand un chemin est fourni. Le halo suit le pointeur. */
function Entree({
  ton,
  titre,
  chemin,
  children,
}: {
  ton: "ciel" | "nuit" | "roi";
  titre: string;
  chemin?: "/contexte" | "/consultation" | "/ateliers" | undefined;
  children?: ReactNode;
}) {
  const suivre = (e: PointerEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <li
      className={`entree entree-${ton} ${ton === "ciel" ? "" : "entree-sombre"}`}
      onPointerMove={suivre}
    >
      <div className="entree-tete">
        <h2 className="entree-titre">
          {chemin ? (
            <Link to={chemin} className="entree-lien">
              {titre}
            </Link>
          ) : (
            titre
          )}
        </h2>
        {chemin && (
          <span className="entree-fleche" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        )}
      </div>
      {children}
    </li>
  );
}
