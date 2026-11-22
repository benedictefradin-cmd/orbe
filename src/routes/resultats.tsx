/** Résultats publics : agrégats seulement. Erreur 404 tant que RESULTATS_PUBLICS vaut false (config.ts). */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Entete, PiedDePage } from "@/components/site";
import { RESULTATS } from "@/lib/contenus";
import { RESULTATS_PUBLICS } from "@/lib/config";
import { getResultatsPublics } from "@/lib/site.functions";
import { metaPage } from "@/lib/partage";

export const Route = createFileRoute("/resultats")({
  loader: async () => {
    if (!RESULTATS_PUBLICS) throw notFound();
    const resultats = await getResultatsPublics();
    if (!resultats) throw notFound();
    return resultats;
  },
  head: () => ({
    meta: metaPage({
      chemin: "/resultats",
      titre: `${RESULTATS.titre} · Consultation citoyenne`,
      description: RESULTATS.avertissement,
      prive: !RESULTATS_PUBLICS,
    }),
  }),
  component: PageResultats,
});

const pourcent = (x: number) =>
  x.toLocaleString("fr-FR", { style: "percent", maximumFractionDigits: 0 });

function PageResultats() {
  const r = Route.useLoaderData();
  return (
    <>
      <Entete />
      <main id="contenu" className="section">
        <div className="conteneur">
          <h1 className="titre-principal">{RESULTATS.titre}</h1>
          <p className="texte-long mt-4">{RESULTATS.total(r.total)}</p>
          <p className="aide mt-2">{RESULTATS.avertissement}</p>
          <div className="mt-8 overflow-x-auto">
            <table className="tableau min-w-[640px]">
              <thead>
                <tr>
                  <th scope="col">{RESULTATS.colonnes.rang}</th>
                  <th scope="col">{RESULTATS.colonnes.mesure}</th>
                  <th scope="col">{RESULTATS.colonnes.points}</th>
                  <th scope="col">{RESULTATS.colonnes.part}</th>
                  <th scope="col">{RESULTATS.colonnes.net}</th>
                </tr>
              </thead>
              <tbody>
                {r.lignes.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.rang}
                      {l.exAequo && <span className="aide block">{RESULTATS.exAequo}</span>}
                    </td>
                    <td>
                      <span className="axe">{l.axe}</span>
                      <span className="block">{l.texte}</span>
                    </td>
                    <td>{l.points ?? RESULTATS.masque}</td>
                    <td>{l.part === null ? RESULTATS.masque : pourcent(l.part)}</td>
                    <td>{l.net ?? RESULTATS.masque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8">
            <Link to="/methode">{RESULTATS.methode}</Link>
          </p>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
