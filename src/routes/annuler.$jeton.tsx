import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Entete, LienExterne, PiedDePage } from "@/components/site";
import { ANNULATION } from "@/lib/contenus";
import { atelierParId, CONTACT_URL, formaterCreneau } from "@/lib/config";
import { annulerMonInscription, getInscription } from "@/lib/site.functions";
import { metaPage } from "@/lib/partage";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/annuler/$jeton")({
  loader: async ({ params }) =>
    UUID.test(params.jeton) ? getInscription({ data: { jeton: params.jeton } }) : null,
  head: () => ({
    meta: metaPage({
      titre: `${ANNULATION.titre} · Ateliers`,
      description: "Libérez votre place pour une autre personne.",
      prive: true,
    }),
  }),
  component: PageAnnulation,
});

function PageAnnulation() {
  const inscription = Route.useLoaderData();
  const { jeton } = Route.useParams();
  const annuler = useServerFn(annulerMonInscription);
  const actives = inscription?.dates.filter((d) => d.statut !== "annule") ?? [];
  const [etat, setEtat] = useState<"attente" | "envoi" | "fait" | "erreur" | "deja">(
    inscription && actives.length === 0 ? "deja" : "attente",
  );

  const confirmer = async () => {
    setEtat("envoi");
    try {
      const r = await annuler({ data: { jeton } });
      setEtat(r === "ok" ? "fait" : r === "deja_annule" ? "deja" : "erreur");
    } catch {
      setEtat("erreur");
    }
  };

  return (
    <>
      <Entete />
      <main id="contenu" className="section">
        <div className="conteneur conteneur-etroit">
          <h1 className="titre-section">{ANNULATION.titre}</h1>
          <div className="carte mt-6" aria-live="polite">
            {!inscription ? (
              <p className="texte-long">{ANNULATION.introuvable}</p>
            ) : etat === "fait" ? (
              <p className="texte-long font-semibold" role="status">
                {ANNULATION.fait}
              </p>
            ) : etat === "deja" ? (
              <p className="texte-long">{ANNULATION.deja}</p>
            ) : (
              <>
                <p className="texte-long font-semibold">
                  {ANNULATION.question(inscription.prenom)}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {actives.map((d) => {
                    const a = atelierParId(d.atelier_id);
                    return a ? (
                      <li key={d.atelier_id} className="rounded-lg bg-fond-alterne p-3">
                        <strong>
                          Atelier {a.numero}, {a.titre}
                        </strong>
                        <br />
                        {formaterCreneau(a.debut, a.fin)}
                        {d.statut === "liste_attente" ? ", liste d'attente" : ""}
                      </li>
                    ) : null;
                  })}
                </ul>
                <p className="mt-4">{ANNULATION.explication}</p>
                {etat === "erreur" && (
                  <p className="erreur mt-4" role="alert">
                    {ANNULATION.erreur}
                  </p>
                )}
                <button
                  type="button"
                  className="bouton bouton-plein mt-6"
                  onClick={() => void confirmer()}
                  disabled={etat === "envoi"}
                  aria-busy={etat === "envoi"}
                >
                  {etat === "envoi" ? "Annulation…" : ANNULATION.bouton}
                </button>
              </>
            )}
          </div>
          <p className="mt-6">
            <LienExterne href={CONTACT_URL}>{ANNULATION.perdu}</LienExterne>
          </p>
          <p className="mt-4">
            <Link to="/" className="inline-flex min-h-11 items-center">
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
