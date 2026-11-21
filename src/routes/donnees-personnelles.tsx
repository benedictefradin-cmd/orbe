import { createFileRoute } from "@tanstack/react-router";
import { Entete, LienExterne, PiedDePage } from "@/components/site";
import { DONNEES } from "@/lib/contenus";
import { CONTACT_URL } from "@/lib/config";
import { getRequestOrigin } from "@/lib/origin.functions";
import { metaPage } from "@/lib/partage";

export const Route = createFileRoute("/donnees-personnelles")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) => ({
    meta: metaPage({
      origine: loaderData,
      chemin: "/donnees-personnelles",
      titre: `${DONNEES.titre} · Consultation citoyenne et ateliers`,
      description: "Comment l'Institut Rousseau et Face à l'inceste protègent vos données.",
    }),
  }),
  component: PageDonnees,
});

function PageDonnees() {
  return (
    <>
      <Entete />
      <main id="contenu" className="section">
        <div className="conteneur conteneur-etroit">
          <h1 className="titre-section">{DONNEES.titre}</h1>
          {DONNEES.sections.map((s) => (
            <section key={s.titre} className="mt-10">
              <h2 className="text-2xl">{s.titre}</h2>
              {s.texte.map((t) => (
                <p key={t} className="texte-long mt-3">
                  {t}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-10">
            <LienExterne href={CONTACT_URL} className="bouton bouton-contour">
              {DONNEES.contact}
            </LienExterne>
          </p>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
