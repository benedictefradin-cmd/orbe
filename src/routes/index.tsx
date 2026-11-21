import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, Lock, Video } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BesoinDeParler, Entete, LienExterne, PiedDePage } from "@/components/site";
import {
  ACCUEIL,
  AGIR,
  CALENDRIER,
  CHIFFRES,
  CONTEXTE,
  FAQ,
  PORTEURS,
  STRUCTURES,
} from "@/lib/contenus";
import { formaterJour } from "@/lib/config";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getEtatSite } from "@/lib/site.functions";
import { metaPage } from "@/lib/partage";
import logoIr from "@/assets/img/logo-institut-rousseau.svg";
import logoFai from "@/assets/img/logo-face-a-l-inceste.svg";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [origine, etat] = await Promise.all([getRequestOrigin(), getEtatSite()]);
    return { origine, etat };
  },
  head: ({ loaderData }) => ({ meta: metaPage({ origine: loaderData?.origine, chemin: "/" }) }),
  component: Accueil,
});

function Accueil() {
  const { etat } = Route.useLoaderData();
  const consultationOuverte = !etat.consultationClose;
  const ateliersOuverts = etat.inscriptionsOuvertes;

  return (
    <>
      <Entete consultationOuverte={consultationOuverte} />
      <main id="contenu">
        {/* Hero */}
        <section className="section pb-12" aria-labelledby="titre-principal">
          <div className="conteneur">
            <div className="max-w-3xl">
              <p className="surtitre">{ACCUEIL.surtitre}</p>
              <h1 id="titre-principal" className="titre-principal mt-4">
                {ACCUEIL.titre}
              </h1>
              <p className="mt-6 font-titre text-[22px] leading-snug text-primaire sm:text-[26px]">
                {ACCUEIL.sousTitre}
              </p>
            </div>
            <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
              {consultationOuverte ? (
                <div className="flex flex-col gap-2">
                  <Link to="/consultation" className="bouton bouton-plein w-full">
                    {ACCUEIL.boutonConsultation}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <p className="mention flex items-center gap-1.5">
                    <Lock size={15} aria-hidden="true" />
                    {ACCUEIL.mentionConsultation}
                  </p>
                </div>
              ) : (
                <p className="carte font-semibold sm:col-span-2" role="status">
                  {ACCUEIL.consultationClose}
                </p>
              )}
              {ateliersOuverts && (
                <div className="flex flex-col gap-2">
                  <Link to="/ateliers" className="bouton bouton-contour w-full">
                    {ACCUEIL.boutonAteliers}
                  </Link>
                  <p className="mention flex items-center gap-1.5">
                    <Video size={15} aria-hidden="true" />
                    {ACCUEIL.mentionAteliers}
                  </p>
                </div>
              )}
            </div>
            <p className="texte-long mt-8 max-w-2xl text-secondaire">{ACCUEIL.promesse}</p>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="section section-alternee" aria-labelledby="chiffres-titre">
          <div className="conteneur">
            <h2 id="chiffres-titre" className="sr-only">
              Chiffres clés
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CHIFFRES.map((c) => (
                <li key={c.valeur} className="carte flex flex-col gap-3">
                  <p className="chiffre">{c.valeur}</p>
                  <p className="text-lg leading-snug">{c.texte}</p>
                  <p className="mention mt-auto text-sm">{c.source}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contexte */}
        <section id="contexte" className="section" aria-labelledby="contexte-titre">
          <div className="conteneur grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 id="contexte-titre" className="titre-section">
                {CONTEXTE.titre}
              </h2>
              <p className="mention mt-4">Mis à jour le {formaterJour(CONTEXTE.miseAJour, true)}</p>
            </div>
            <div>
              <ol className="frise">
                {CONTEXTE.frise.map((e) => (
                  <li key={e.date}>
                    <time>{e.date}</time>
                    <p className="texte-long mt-1">{e.texte}</p>
                  </li>
                ))}
              </ol>
              <p className="carte carte-accent texte-long mt-4">{CONTEXTE.encadre}</p>
            </div>
          </div>
        </section>

        {/* Deux façons d'agir */}
        <section id="agir" className="section section-alternee" aria-labelledby="agir-titre">
          <div className="conteneur">
            <h2 id="agir-titre" className="titre-section">
              {AGIR.titre}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_1fr]">
              <article className="carte carte-accent flex flex-col gap-4">
                <p className="surtitre">Étape 1</p>
                <h3 className="text-2xl">{AGIR.consultation.titre}</h3>
                <p>{AGIR.consultation.texte}</p>
                <ul className="flex flex-col gap-2">
                  {AGIR.consultation.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <Clock
                        size={18}
                        className="mt-0.5 flex-none text-accent"
                        aria-hidden="true"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {consultationOuverte ? (
                    <Link to="/consultation" className="bouton bouton-plein w-full sm:w-auto">
                      {AGIR.consultation.bouton}
                    </Link>
                  ) : (
                    <p className="font-semibold">{ACCUEIL.consultationClose}</p>
                  )}
                </div>
              </article>
              <article className="carte flex flex-col gap-4">
                <p className="surtitre">Étape 2</p>
                <h3 className="text-2xl">{AGIR.ateliers.titre}</h3>
                <p>{AGIR.ateliers.texte}</p>
                <ul className="flex flex-col gap-2">
                  {AGIR.ateliers.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 flex-none text-accent"
                        aria-hidden="true"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {ateliersOuverts ? (
                    <Link to="/ateliers" className="bouton bouton-contour w-full sm:w-auto">
                      {AGIR.ateliers.bouton}
                    </Link>
                  ) : (
                    <p className="badge badge-annule text-base">{AGIR.ateliers.clos}</p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Calendrier */}
        <section id="calendrier" className="section" aria-labelledby="calendrier-titre">
          <div className="conteneur">
            <h2 id="calendrier-titre" className="titre-section">
              {CALENDRIER.titre}
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-5">
              {CALENDRIER.etapes.map((e, i) => (
                <li
                  key={e.quand}
                  id={e.ancre}
                  className={`carte flex flex-col gap-2 ${i === CALENDRIER.etapes.length - 1 ? "carte-accent" : ""}`}
                >
                  <p className="font-display text-lg font-bold capitalize text-primaire">
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
                  ["ir", logoIr],
                  ["fai", logoFai],
                ] as const
              ).map(([cle, logo]) => (
                <article key={cle} className="carte flex flex-col gap-4">
                  <img
                    src={logo}
                    alt=""
                    className="h-10 w-auto self-start"
                    width={200}
                    height={47}
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
            <BesoinDeParler id="aide-accueil" />
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
