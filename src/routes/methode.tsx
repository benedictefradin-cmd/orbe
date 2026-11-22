import { createFileRoute, Link } from "@tanstack/react-router";
import { Entete, PiedDePage } from "@/components/site";
import { METHODE } from "@/lib/contenus";
import { getRequestOrigin } from "@/lib/origin.functions";
import { metaPage } from "@/lib/partage";

export const Route = createFileRoute("/methode")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) => ({
    meta: metaPage({
      origine: loaderData,
      chemin: "/methode",
      titre: `${METHODE.titre} · Consultation citoyenne`,
      description: METHODE.intro,
    }),
  }),
  component: PageMethode,
});

function PageMethode() {
  return (
    <>
      <Entete />
      <main id="contenu" className="section">
        <div className="conteneur conteneur-etroit">
          <h1 className="titre-section">{METHODE.titre}</h1>
          <p className="texte-long mt-4">{METHODE.intro}</p>
          {METHODE.sections.map((s) => (
            <section key={s.titre} className="mt-10">
              <h2 className="text-2xl">{s.titre}</h2>
              {s.textes.map((t) => (
                <p key={t} className="texte-long mt-3">
                  {t}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-10">
            <Link to="/consultation" className="bouton bouton-contour">
              {METHODE.retour}
            </Link>
          </p>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
