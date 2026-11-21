import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { isClosed, RESTITUTION } from "@/lib/consultation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enfance et présidentielle 2027, classez les mesures qui comptent" },
      { name: "description", content: "Consultation de l'Institut Rousseau et de Face à l'inceste. Classez 24 mesures contre l'inceste et rejoignez un atelier." },
      { property: "og:title", content: "Enfance et présidentielle 2027, classez les mesures qui comptent" },
      { property: "og:description", content: "Classez 24 mesures contre l'inceste en 5 minutes et rejoignez un atelier en visio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

const ETAPES = [
  "Je classe les mesures",
  "Je rejoins un atelier",
  `Je découvre la synthèse ${RESTITUTION.replace(" 2027", "")}`,
];

function Accueil() {
  const [closed, setClosed] = useState(false);
  useEffect(() => setClosed(isClosed()), []);

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-5 pt-10 sm:pt-16">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Consultation citoyenne</p>
        <h1 className="mt-3 text-4xl font-semibold text-primary sm:text-5xl">
          Enfance et présidentielle 2027, classez les mesures qui comptent
        </h1>

        {closed ? (
          <div className="mt-8 rounded-lg bg-secondary p-6">
            <p className="text-xl font-bold">La consultation est close, merci.</p>
            <p className="mt-2">La synthèse sera présentée {RESTITUTION}.</p>
          </div>
        ) : (
          <>
            <p className="mt-6 max-w-xl text-lg">
              L'Institut Rousseau et Face à l'inceste vous invitent à choisir les mesures prioritaires contre l'inceste. Vos réponses nourriront nos propositions aux candidats.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link to="/participer" className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground hover:bg-primary/90">
                Je participe
              </Link>
              <p className="text-muted-foreground">Environ 5 minutes. Aucune expertise n'est requise.</p>
            </div>
          </>
        )}
      </section>

      <section aria-label="Chiffres clés" className="mx-auto mt-14 grid max-w-3xl gap-4 px-5 sm:grid-cols-2">
        <figure className="rounded-lg bg-secondary p-6">
          <p className="font-serif text-4xl font-semibold text-primary">160 000</p>
          <p className="mt-2">enfants victimes de violences sexuelles chaque année</p>
          <figcaption className="mt-3 text-sm text-muted-foreground">Source CIIVISE, 2023</figcaption>
        </figure>
        <figure className="rounded-lg bg-secondary p-6">
          <p className="font-serif text-4xl font-semibold text-primary">1 sur 10</p>
          <p className="mt-2">Un Français sur dix déclare avoir été victime d'inceste</p>
          <figcaption className="mt-3 text-sm text-muted-foreground">Source Ipsos pour Face à l'inceste, 2023</figcaption>
        </figure>
      </section>

      <section aria-labelledby="etapes" className="mx-auto mt-14 max-w-3xl px-5">
        <h2 id="etapes" className="text-2xl font-semibold text-primary">Trois étapes</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e} className="border-t-2 border-primary pt-4">
              <span className="font-serif text-3xl font-semibold text-accent-text">{i + 1}</span>
              <p className="mt-2 text-lg">{e}</p>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
}
