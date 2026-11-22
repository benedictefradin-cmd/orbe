import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChiffresCles, Frise } from "@/components/contexte";
import { Entete, LienExterne, PiedDePage } from "@/components/site";
import { ACCUEIL, CALENDRIER, CONTEXTE, FAQ, META, PORTEURS, STRUCTURES } from "@/lib/contenus";
import { formaterJour } from "@/lib/config";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getEtatSite } from "@/lib/site.functions";
import { metaPage, urlAbsolue } from "@/lib/partage";
import logoIr from "@/assets/img/logo-institut-rousseau.svg";
import logoFai from "@/assets/img/logo-face-a-l-inceste.png";

export const Route = createFileRoute("/contexte")({
  loader: async () => {
    const [origine, etat] = await Promise.all([getRequestOrigin(), getEtatSite()]);
    return { origine, etat };
  },
  head: ({ loaderData }) => ({
    meta: metaPage({
      origine: loaderData?.origine,
      chemin: "/contexte",
      titre: `${CONTEXTE.surtitre} · Protection de l'enfance et présidentielle 2027`,
      description: META.contexte,
    }),
    links: loaderData
      ? [{ rel: "canonical", href: urlAbsolue(loaderData.origine, "/contexte") }]
      : [],
  }),
  component: PageContexte,
});

/** Libellé de l'accordéon des textes « Pourquoi » en mobile. À déplacer dans contenus.ts (docs/refonte/hors-perimetre.md). */
const LIRE_LA_SUITE = "Lire la suite";

/** Premier paragraphe visible, la suite repliée sous 768 px et ouverte au delà. */
function TextesRepliables({ textes }: { textes: readonly string[] }) {
  const [premier, ...suite] = textes;
  return (
    <>
      <p className="texte-long">{premier}</p>
      {suite.length > 0 && (
        <>
          <details className="deplier suite-mobile">
            <summary>
              <span className="plus" aria-hidden="true" />
              {LIRE_LA_SUITE}
            </summary>
            {suite.map((t) => (
              <p key={t} className="texte-long mt-2">
                {t}
              </p>
            ))}
          </details>
          <div className="suite-ecran">
            {suite.map((t) => (
              <p key={t} className="texte-long">
                {t}
              </p>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function PageContexte() {
  const { etat } = Route.useLoaderData();
  const consultationOuverte = !etat.consultationClose;
  const ateliersOuverts = etat.inscriptionsOuvertes;
  const { pourquoiConsultation, pourquoiAteliers, aQuoiCaSert } = CONTEXTE;

  return (
    <>
      <Entete />
      <main id="contenu">
        {/* Introduction */}
        <section className="section intro-page" aria-labelledby="titre-principal">
          <div className="conteneur">
            <p className="surtitre">{CONTEXTE.surtitre}</p>
            <h1 id="titre-principal" className="titre-principal mt-3 max-w-[18ch]">
              {CONTEXTE.titre.replace(" :", "\u00a0:")}
            </h1>
            <p className="lead">{CONTEXTE.intro}</p>
          </div>
        </section>

        <ChiffresCles />

        {/* Ce qui bouge */}
        <section className="section section-filet" aria-labelledby="loi-titre">
          <div className="conteneur grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 id="loi-titre" className="titre-section">
                {CONTEXTE.loiTitre}
              </h2>
              <p className="meta mt-3">Mis à jour le {formaterJour(CONTEXTE.miseAJour, true)}</p>
            </div>
            <div>
              <Frise />
            </div>
          </div>
        </section>

        {/* Pourquoi une consultation, pourquoi des ateliers */}
        <section className="section section-filet" aria-label="Notre démarche">
          <div className="conteneur demarche">
            <article className="demarche-bloc" aria-labelledby="consultation-titre">
              <h2 id="consultation-titre" className="titre-section">
                {pourquoiConsultation.titre}
              </h2>
              <div className="flex flex-col gap-3">
                <TextesRepliables textes={pourquoiConsultation.textes} />
                <div className="pt-2">
                  {consultationOuverte ? (
                    <Link to="/consultation" className="bouton bouton-plein">
                      {pourquoiConsultation.bouton}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    <p className="font-titre font-semibold text-navy">
                      {ACCUEIL.entrees.consultation.close}
                    </p>
                  )}
                </div>
              </div>
            </article>
            <article className="demarche-bloc" aria-labelledby="ateliers-titre">
              <h2 id="ateliers-titre" className="titre-section">
                {pourquoiAteliers.titre}
              </h2>
              <div className="flex flex-col gap-3">
                <TextesRepliables textes={pourquoiAteliers.textes} />
                <div>
                  {ateliersOuverts ? (
                    <Link to="/ateliers" className="lien-fort">
                      {pourquoiAteliers.bouton}
                    </Link>
                  ) : (
                    <p className="font-titre font-semibold text-navy">{pourquoiAteliers.clos}</p>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* À quoi cela va servir, calendrier */}
        <section className="section section-filet" aria-labelledby="servir-titre">
          <div className="conteneur">
            <h2 id="servir-titre" className="titre-section">
              {aQuoiCaSert.titre}
            </h2>
            <p className="texte-long mt-3">{aQuoiCaSert.texte}</p>
            <h3 id="calendrier-titre" className="titre-bloc mt-8">
              {CALENDRIER.titre}
            </h3>
            {/* Défilement horizontal en mobile : la liste reçoit le focus pour défiler au clavier. */}
            <ol
              className="defilement defilement-4 mt-4"
              tabIndex={0}
              aria-labelledby="calendrier-titre"
            >
              {CALENDRIER.etapes.map((e) => (
                <li key={e.quand}>
                  <p className="calendrier-quand">{e.quand}</p>
                  <p>{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Qui porte la démarche */}
        <section className="section section-filet" aria-labelledby="porteurs-titre">
          <div className="conteneur">
            <h2 id="porteurs-titre" className="titre-section">
              {PORTEURS.titre}
            </h2>
            <ul className="defilement defilement-2 mt-6">
              {(
                [
                  ["ir", logoIr, 221, 47, "h-7"],
                  ["fai", logoFai, 322, 139, "h-12"],
                ] as const
              ).map(([cle, logo, largeur, hauteur, classe]) => (
                <li key={cle}>
                  <div className="flex h-12 items-center">
                    <img
                      src={logo}
                      alt=""
                      className={`porteur-logo ${classe}`}
                      width={largeur}
                      height={hauteur}
                    />
                  </div>
                  <h3 className="titre-bloc">{STRUCTURES[cle].nom}</h3>
                  <p className="texte-long">{STRUCTURES[cle].presentation}</p>
                  <LienExterne href={STRUCTURES[cle].site} className="lien-fort mt-auto">
                    Découvrir {STRUCTURES[cle].nom}
                  </LienExterne>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Questions fréquentes */}
        <section className="section section-filet" aria-labelledby="faq-titre">
          <div className="conteneur grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <h2 id="faq-titre" className="titre-section">
              Questions fréquentes
            </h2>
            <Accordion type="multiple" className="faq">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}>
                  <AccordionTrigger className="faq-question">{f.q}</AccordionTrigger>
                  <AccordionContent className="texte-long">{f.r}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
