import { CHIFFRES, CONTEXTE } from "@/lib/contenus";
import { Marque } from "@/components/ui/trait";

/** Libellé de l'accordéon de la frise en mobile. À déplacer dans contenus.ts (docs/refonte/hors-perimetre.md). */
const VOIR_HISTORIQUE = "Voir tout l'historique";
/** Étapes toujours visibles sous 768 px, les plus récentes. */
const VISIBLES_MOBILE = 3;

/** « 160 000 » → « 160 000 » et « », « 77 % » → « 77 » et « % », « 1 personne sur 10 » → « 1 » et « personne sur 10 ». */
function decouper(valeur: string) {
  const m = /^(\d[\d ]*\d|\d)\s*(.*)$/.exec(valeur);
  return m ? { nombre: m[1]!, unite: m[2] ?? "" } : { nombre: valeur, unite: "" };
}

/** Chiffres clés, fixes : comme une une de presse, un filet navy au dessus de chaque nombre. */
export function ChiffresCles() {
  return (
    <section className="section" aria-labelledby="chiffres-titre">
      <div className="conteneur">
        <h2 id="chiffres-titre" className="titre-section">
          {CONTEXTE.chiffresTitre}
        </h2>
        <ul className="chiffres-liste">
          {CHIFFRES.map((c) => {
            const { nombre, unite } = decouper(c.valeur);
            const court = unite.length <= 2;
            return (
              <li key={c.valeur}>
                <p className="chiffre-valeur">
                  {nombre}
                  {unite && (
                    <span
                      className={court ? "chiffre-unite chiffre-unite-courte" : "chiffre-unite"}
                    >
                      {" "}
                      {unite}
                    </span>
                  )}
                </p>
                <p className="chiffre-texte">{c.texte}</p>
                <p className="chiffre-source meta">{c.source}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** « 21 juillet 2026 » → « 21 juillet » et « 2026 ». */
function decouperDate(date: string) {
  const m = /^(.*)\s(\d{4})$/.exec(date);
  return m ? { jour: m[1]!, annee: m[2]! } : { jour: "", annee: date };
}

type Etape = (typeof CONTEXTE.frise)[number];

function EtapeFrise({
  etape,
  anneePrecedente,
  courant,
  ancienne,
}: {
  etape: Etape;
  anneePrecedente: string | undefined;
  courant: boolean;
  ancienne: boolean;
}) {
  const { jour, annee } = decouperDate(etape.date);
  // L'année n'est écrite dans la marge qu'à son premier passage, et pour l'étape en cours.
  const montrerAnnee = courant || annee !== anneePrecedente;
  return (
    <li
      className={["frise-item", courant && "frise-courant", ancienne && "frise-ancienne"]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="frise-annee" aria-hidden="true">
        {montrerAnnee && (courant ? <Marque geste="entourer">{annee}</Marque> : annee)}
      </p>
      <div className="frise-corps">
        <p className="frise-jour">
          <time>
            {jour} <span className="sr-only">{annee}</span>
          </time>
          {courant && <span className="frise-en-cours"> ({CONTEXTE.friseEnCours})</span>}
        </p>
        <p className="frise-texte">{etape.texte}</p>
      </div>
    </li>
  );
}

/** Frise : les années dans la marge, un filet navy vertical. Sous 768 px, l'historique est replié. */
export function Frise() {
  const etapes = CONTEXTE.frise;
  const dernier = etapes.length - 1;
  const premiereVisible = Math.max(0, etapes.length - VISIBLES_MOBILE);
  const annee = (i: number) => (i > 0 ? decouperDate(etapes[i - 1]!.date).annee : undefined);
  return (
    <>
      <details className="frise-historique deplier">
        <summary>
          <span className="plus" aria-hidden="true" />
          {VOIR_HISTORIQUE}
        </summary>
        <ol className="frise mt-3">
          {etapes.slice(0, premiereVisible).map((e, i) => (
            <EtapeFrise
              key={e.date}
              etape={e}
              anneePrecedente={annee(i)}
              courant={false}
              ancienne={false}
            />
          ))}
        </ol>
      </details>
      <ol className="frise">
        {etapes.map((e, i) => (
          <EtapeFrise
            key={e.date}
            etape={e}
            // La première étape visible en mobile affiche toujours son année.
            anneePrecedente={i === premiereVisible ? undefined : annee(i)}
            courant={i === dernier}
            ancienne={i < premiereVisible}
          />
        ))}
      </ol>
      <p className="frise-conclusion">{CONTEXTE.encadre}</p>
    </>
  );
}
