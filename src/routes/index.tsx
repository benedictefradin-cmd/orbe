import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Entete, PiedDePage } from "@/components/site";
import { CompteurReponses } from "@/components/compteur";
import { Marque, Trait } from "@/components/ui/trait";
import { ACCUEIL, CRENEAU_1, CRENEAU_2, DATE_LIMITE_INSCRIPTION, META } from "@/lib/contenus";
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

/** Souligne d'un trait corail chaque passage à mettre en valeur. */
function souligner(texte: string, passages: readonly string[], motion: string): ReactNode[] {
  const motif = new RegExp(`(${passages.join("|")})`);
  return texte.split(motif).map((morceau, i) =>
    passages.includes(morceau) ? (
      <Marque key={i} geste="souligner" motion={motion}>
        {morceau}
      </Marque>
    ) : (
      morceau
    ),
  );
}

/** Accueil : la grande voix à gauche, un sommaire de trois entrées à droite. */
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
        <section className="accueil" aria-labelledby="titre-principal">
          <div className="conteneur accueil-grille">
            <div>
              <p className="surtitre" data-entree="0">
                {ACCUEIL.surtitre}
              </p>
              <h1 id="titre-principal" className="titre-principal titre-mega" data-entree="1">
                {souligner(ACCUEIL.titre, ACCUEIL.titreSouligne, "ensemble")}
              </h1>
              <p className="lead" data-entree="2">
                {ACCUEIL.intro}
              </p>
              <p className="appel" data-entree="2">
                {ACCUEIL.appel}
              </p>
              {(consultationOuverte || ateliersOuverts) && (
                <p className="echeance" data-entree="3">
                  <span className="echeance-date">
                    {souligner(ACCUEIL.cloture, [DATE_LIMITE_INSCRIPTION], "echeance")}
                  </span>
                  {restant && <span className="meta">{restant}</span>}
                </p>
              )}
            </div>

            <ol className="sommaire" data-entree="3">
              <li>
                {consultationOuverte && (
                  <Trait geste="fleche" className="trait-fleche" motion="fleche" />
                )}
                <p className="sommaire-etiquette">{consultation.etiquette}</p>
                <h2 className="sommaire-titre">
                  {consultationOuverte ? (
                    <Link to="/consultation" className="bouton bouton-plein">
                      {consultation.titre}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    consultation.titreClos
                  )}
                </h2>
                {consultationOuverte ? (
                  <CompteurReponses valeur={etat.compteur} className="meta" />
                ) : (
                  <p className="texte-long mt-2" role="status">
                    {consultation.close}
                  </p>
                )}
              </li>

              <li>
                <p className="sommaire-etiquette">{ateliers.etiquette}</p>
                <h2 className="sommaire-titre">
                  {ateliersOuverts ? (
                    <Link to="/ateliers" className="lien-texte">
                      {ateliers.titre}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-11 items-center">{ateliers.titreClos}</span>
                  )}
                </h2>
                {ateliersOuverts ? (
                  <ul className="meta">
                    <li>{CRENEAU_1}</li>
                    <li>{CRENEAU_2}</li>
                    {ateliers.places && <li className="sommaire-places">{ateliers.places}</li>}
                  </ul>
                ) : (
                  <p className="meta">{ateliers.clos}</p>
                )}
              </li>

              <li>
                <p className="sommaire-etiquette">{contexte.etiquette}</p>
                <h2 className="sommaire-titre">
                  <Link to="/contexte" className="lien-texte">
                    {contexte.titre}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </h2>
              </li>
            </ol>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
