/** Classement des mesures : on touche une mesure pour l'ajouter, on change l'ordre avec des boutons. Clavier et doigt. */
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { CONSULTATION } from "@/lib/contenus";
import { melanger, MESURES, mesureParId, type Mesure } from "@/lib/mesures";
import { NOMBRE_MESURES_A_CLASSER } from "@/lib/config";

const T = CONSULTATION.priorites;

export function Classement({
  valeur,
  onChange,
  erreur,
}: {
  valeur: string[];
  onChange: (v: string[]) => void;
  erreur?: string | undefined;
}) {
  const [ordre, setOrdre] = useState<readonly Mesure[]>(MESURES);
  const [annonce, setAnnonce] = useState("");
  // Ordre mélangé côté navigateur uniquement, une fois par visite.
  useEffect(() => {
    setOrdre(melanger(MESURES));
  }, []);
  const plein = valeur.length >= NOMBRE_MESURES_A_CLASSER;

  const basculer = (id: string) => {
    if (valeur.includes(id)) {
      onChange(valeur.filter((x) => x !== id));
      setAnnonce("Mesure retirée de votre classement.");
      return;
    }
    if (plein) return;
    onChange([...valeur, id]);
    setAnnonce(`Mesure ajoutée en position ${valeur.length + 1} sur ${NOMBRE_MESURES_A_CLASSER}.`);
  };
  const deplacer = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= valeur.length) return;
    const copie = [...valeur];
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
    onChange(copie);
    setAnnonce(`Mesure déplacée en position ${j + 1}.`);
  };

  return (
    <div
      id="champ-classement"
      tabIndex={-1}
      aria-describedby={erreur ? "classement-erreur" : undefined}
    >
      <p className="texte-long">{T.intro}</p>
      <p className="aide mt-2">{T.aide}</p>

      <section
        className="mt-6 rounded-xl border border-bordure-forte bg-fond-alterne p-4"
        aria-labelledby="mon-classement"
      >
        <h3 id="mon-classement" className="font-sans text-lg font-bold">
          Mon classement, {valeur.length} sur {NOMBRE_MESURES_A_CLASSER}
        </h3>
        {valeur.length === 0 && <p className="aide mt-2">{T.vide}</p>}
        <ol className="mt-3 flex flex-col gap-2">
          {valeur.map((id, i) => {
            const m = mesureParId(id)!;
            return (
              <li
                key={id}
                className="flex flex-col gap-2 rounded-lg border border-accent bg-white p-3 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-start gap-3">
                  <span className="rang" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <span className="sr-only">Position {i + 1}, </span>
                    {m.texte}
                  </span>
                </div>
                <div className="flex flex-none gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => deplacer(i, -1)}
                    disabled={i === 0}
                    aria-label={`${T.monter}, ${m.texte}`}
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => deplacer(i, 1)}
                    disabled={i === valeur.length - 1}
                    aria-label={`${T.descendre}, ${m.texte}`}
                  >
                    <ArrowDown size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => basculer(id)}
                    aria-label={`${T.retirer}, ${m.texte}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
          {Array.from({ length: NOMBRE_MESURES_A_CLASSER - valeur.length }, (_, k) => (
            <li
              key={`vide${k}`}
              className="flex items-center gap-3 rounded-lg border border-dashed border-bordure-forte p-3 text-secondaire"
              aria-hidden="true"
            >
              <span className="rang rang-vide">{valeur.length + k + 1}</span>
              <span className="text-[15px]">À choisir</span>
            </li>
          ))}
        </ol>
        {plein && <p className="mt-3 font-semibold text-accent-survol">{T.complet}</p>}
      </section>

      {erreur && (
        <p id="classement-erreur" className="erreur mt-4" role="alert">
          {erreur}
        </p>
      )}

      <h3 className="mt-8 font-sans text-lg font-bold">Les 24 mesures</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {ordre.map((m) => {
          const rang = valeur.indexOf(m.id);
          const choisie = rang >= 0;
          return (
            <li key={m.id}>
              <button
                type="button"
                className="mesure"
                aria-pressed={choisie}
                disabled={!choisie && plein}
                onClick={() => basculer(m.id)}
              >
                <span className={`rang ${choisie ? "" : "rang-vide"}`} aria-hidden="true">
                  {choisie ? rang + 1 : "+"}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="axe">{m.axe}</span>
                  <span>{m.texte}</span>
                  <span className="text-[13px] text-secondaire">
                    {T.sources}, {m.sources}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-bordure-forte bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <a
          href="#mon-classement"
          className="flex min-h-11 items-center justify-between gap-3 font-semibold no-underline"
        >
          <span>
            {valeur.length} sur {NOMBRE_MESURES_A_CLASSER} choisies
          </span>
          <span className="text-accent">Voir mon classement</span>
        </a>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {annonce}
      </p>
    </div>
  );
}
