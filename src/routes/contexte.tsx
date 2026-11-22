import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChiffresCles, Frise } from "@/components/contexte";
import { BesoinDeParler, Entete, LienExterne, PiedDePage } from "@/components/site";
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
        <section className="section pb-12" aria-labelledby="titre-principal">
          <div className="conteneur">
            <div className="max-w-3xl">
              <p className="surtitre">{CONTEXTE.surtitre}</p>
              <h1 id="titre-principal" className="titre-principal mt-4">
                {CONTEXTE.titre}
              </h1>
              <p className="texte-long mt-6 text-secondaire">{CONTEXTE.intro}</p>
            </div>
          </div>
        </section>

        <ChiffresCles />

        {/* Ce qui bouge */}
        <section className="section" aria-labelledby="loi-titre">
          <div className="conteneur grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="loi-titre" className="titre-section">
                {CONTEXTE.loiTitre}
              </h2>
              <p className="mise-a-jour mt-5">
                Mis à jour le {formaterJour(CONTEXTE.miseAJour, true)}
              </p>
            </div>
            <div>
              <Frise />
            </div>
          </div>
        </section>

        {/* Pourquoi une consultation, pourquoi des ateliers */}
        <section className="section section-alternee" aria-label="Notre démarche">
          <div className="conteneur grid gap-6 md:grid-cols-2">
            <article className="carte flex flex-col gap-4" aria-labelledby="consultation-titre">
              <h2 id="consultation-titre" className="text-2xl">
                {pourquoiConsultation.titre}
              </h2>
              {pourquoiConsultation.textes.map((t) => (
                <p key={t} className="texte-long">
                  {t}
                </p>
              ))}
              <div className="mt-auto pt-2">
                {consultationOuverte ? (
                  <Link to="/consultation" className="bouton bouton-plein w-full sm:w-auto">
                    {pourquoiConsultation.bouton}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="font-semibold">{ACCUEIL.entrees.consultation.close}</p>
                )}
              </div>
            </article>
            <article className="carte flex flex-col gap-4" aria-labelledby="ateliers-titre">
              <h2 id="ateliers-titre" className="text-2xl">
                {pourquoiAteliers.titre}
              </h2>
              {pourquoiAteliers.textes.map((t) => (
                <p key={t} className="texte-long">
                  {t}
                </p>
              ))}
              <div className="mt-auto pt-2">
                {ateliersOuverts ? (
                  <Link to="/ateliers" className="bouton bouton-contour w-full sm:w-auto">
                    {pourquoiAteliers.bouton}
                  </Link>
                ) : (
                  <p className="badge badge-annule text-base">{pourquoiAteliers.clos}</p>
                )}
              </div>
            </article>
          </div>
        </section>

        {/* À quoi cela va servir, calendrier */}
        <section className="section" aria-labelledby="servir-titre">
          <div className="conteneur">
            <h2 id="servir-titre" className="titre-section">
              {aQuoiCaSert.titre}
            </h2>
            <p className="texte-long mt-4 max-w-3xl">{aQuoiCaSert.texte}</p>
            <h3 className="mt-10 text-2xl">{CALENDRIER.titre}</h3>
            <ol className="mt-6 grid gap-4 md:grid-cols-4">
              {CALENDRIER.etapes.map((e, i) => (
                <li
                  key={e.quand}
                  className={`carte flex flex-col gap-2 ${i === CALENDRIER.etapes.length - 1 ? "carte-accent" : ""}`}
                >
                  <p className="font-display text-lg font-bold first-letter:uppercase text-primaire">
                    {e.quand}
                  </p>
                  <p>{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Qui porte la démarche */}
        <section className="section section-alternee" aria-labelledby="porteurs-titre">
          <div className="conteneur">
            <h2 id="porteurs-titre" className="titre-section">
              {PORTEURS.titre}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {(
                [
                  ["ir", logoIr, 221, 47, "h-10"],
                  ["fai", logoFai, 322, 139, "h-16"],
                ] as const
              ).map(([cle, logo, largeur, hauteur, classe]) => (
                <article key={cle} className="carte flex flex-col gap-4">
                  <img
                    src={logo}
                    alt=""
                    className={`${classe} w-auto self-start`}
                    width={largeur}
                    height={hauteur}
                  />
                  <h3 className="text-2xl">{STRUCTURES[cle].nom}</h3>
                  <p className="texte-long">{STRUCTURES[cle].presentation}</p>
                  <LienExterne
                    href={STRUCTURES[cle].site}
                    className="mt-auto inline-flex min-h-11 items-center font-semibold"
                  >
                    Découvrir {STRUCTURES[cle].nom}
                  </LienExterne>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Besoin de parler */}
        <section className="section py-12" aria-label="Numéros d'aide">
          <div className="conteneur">
            <BesoinDeParler id="aide-contexte" />
          </div>
        </section>

        {/* Questions fréquentes */}
        <section className="section section-alternee" aria-labelledby="faq-titre">
          <div className="conteneur conteneur-etroit">
            <h2 id="faq-titre" className="titre-section">
              Questions fréquentes
            </h2>
            <Accordion type="multiple" className="mt-6">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`} className="border-bordure-forte">
                  <AccordionTrigger>{f.q}</AccordionTrigger>
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
