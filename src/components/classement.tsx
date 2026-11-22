/**
 * Classement des mesures : on touche une mesure pour l'ajouter, on change l'ordre avec des boutons. Clavier et doigt.
 * L'ordre de présentation est tiré par le parent une seule fois par visite, et gardé au retour sur l'étape.
 * Aucun bouton n'est jamais désactivé (disabled) : aria-disabled garde le focus là où il est.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { CONSULTATION } from "@/lib/contenus";
import { AXES, formaterSource, mesureParId, type Mesure } from "@/lib/mesures";
import { NOMBRE_MESURES_A_CLASSER } from "@/lib/config";

const T = CONSULTATION.priorites;
const N = NOMBRE_MESURES_A_CLASSER;

type Action = "monter" | "descendre" | "retirer";

export function Classement({
  valeur,
  onChange,
  erreur,
  ordre,
}: {
  valeur: string[];
  onChange: (v: string[]) => void;
  erreur?: string | undefined;
  /** Les 24 identifiants dans l'ordre tiré pour cette visite, null tant qu'il n'est pas tiré. */
  ordre: readonly string[] | null;
}) {
  const [annonce, setAnnonce] = useState("");
  const [axe, setAxe] = useState<string | null>(null);
  const [ouverts, setOuverts] = useState<ReadonlySet<string>>(new Set());
  const boutons = useRef(new Map<string, HTMLButtonElement>());
  const titre = useRef<HTMLHeadingElement>(null);
  const focusApres = useRef<string | null>(null);
  const plein = valeur.length >= N;

  // Après un déplacement ou un retrait, le focus va au bouton prévu une fois la liste redessinée.
  useEffect(() => {
    const cle = focusApres.current;
    if (!cle) return;
    focusApres.current = null;
    if (cle === "titre") titre.current?.focus();
    else boutons.current.get(cle)?.focus();
  }, [valeur]);

  const ref = (cle: string) => (el: HTMLButtonElement | null) => {
    if (el) boutons.current.set(cle, el);
    else boutons.current.delete(cle);
  };
  const texte = (id: string) => mesureParId(id)?.texte ?? id;

  const basculer = (id: string) => {
    if (valeur.includes(id)) {
      onChange(valeur.filter((x) => x !== id));
      setAnnonce(T.annonces.retrait(texte(id)));
      return;
    }
    if (plein) return setAnnonce(T.annonces.plein);
    onChange([...valeur, id]);
    setAnnonce(T.annonces.ajout(valeur.length + 1, N, texte(id)));
  };

  const deplacer = (i: number, delta: number, action: Action) => {
    const j = i + delta;
    if (j < 0) return setAnnonce(T.annonces.dejaPremiere);
    if (j >= valeur.length) return setAnnonce(T.annonces.dejaDerniere);
    const copie = [...valeur];
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
    focusApres.current = `${action}-${valeur[i]}`;
    onChange(copie);
    setAnnonce(T.annonces.deplacement(j + 1, N, texte(valeur[i]!)));
  };

  const retirer = (i: number) => {
    const id = valeur[i]!;
    const suivant = valeur[i + 1];
    focusApres.current = suivant ? `retirer-${suivant}` : "titre";
    onChange(valeur.filter((x) => x !== id));
    setAnnonce(T.annonces.retrait(texte(id)));
  };

  const mesures = (ordre ?? []).map((id) => mesureParId(id)).filter((m): m is Mesure => !!m);
  const visibles = axe ? mesures.filter((m) => m.axe === axe) : mesures;

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
        <h3
          id="mon-classement"
          ref={titre}
          tabIndex={-1}
          className="font-sans text-lg font-bold outline-none"
        >
          {T.titreClassement(valeur.length, N)}
        </h3>
        {valeur.length === 0 && <p className="aide mt-2">{T.vide}</p>}
        <ol className="mt-3 flex flex-col gap-2">
          {valeur.map((id, i) => {
            const m = mesureParId(id)!;
            const premier = i === 0;
            const dernier = i === valeur.length - 1;
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
                    ref={ref(`monter-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => deplacer(i, -1, "monter")}
                    aria-disabled={premier || undefined}
                    aria-label={`${T.monter}, ${m.texte}`}
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                  <button
                    ref={ref(`descendre-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => deplacer(i, 1, "descendre")}
                    aria-disabled={dernier || undefined}
                    aria-label={`${T.descendre}, ${m.texte}`}
                  >
                    <ArrowDown size={18} aria-hidden="true" />
                  </button>
                  <button
                    ref={ref(`retirer-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit"
                    onClick={() => retirer(i)}
                    aria-label={`${T.retirer}, ${m.texte}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
          {Array.from({ length: N - valeur.length }, (_, k) => (
            <li
              key={`vide${k}`}
              className="flex items-center gap-3 rounded-lg border border-dashed border-bordure-forte p-3 text-secondaire"
              aria-hidden="true"
            >
              <span className="rang rang-vide">{valeur.length + k + 1}</span>
              <span className="text-[15px]">{T.aChoisir}</span>
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

      <h3 className="mt-8 font-sans text-lg font-bold">{T.titreListe}</h3>
      <p className="aide mt-1">{T.ordre}</p>

      {/* Filtres : ils masquent des mesures sans jamais changer l'ordre tiré. */}
      <div className="mt-4" role="group" aria-labelledby="filtres-axes">
        <p id="filtres-axes" className="etiquette">
          {T.filtres}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[null, ...AXES].map((a) => (
            <button
              key={a ?? "tous"}
              type="button"
              className="bouton bouton-contour bouton-petit"
              aria-pressed={axe === a}
              onClick={() => {
                setAxe(a);
                const n = a ? mesures.filter((m) => m.axe === a).length : mesures.length;
                setAnnonce(T.affichees(n));
              }}
            >
              {a ?? T.tousLesAxes}
            </button>
          ))}
        </div>
      </div>

      {ordre === null ? (
        <p className="aide mt-4">{T.chargement}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {visibles.map((m) => {
            const rang = valeur.indexOf(m.id);
            const choisie = rang >= 0;
            const ouvert = ouverts.has(m.id);
            return (
              <li key={m.id} className="flex flex-col gap-1">
                <button
                  type="button"
                  className="mesure"
                  aria-pressed={choisie}
                  aria-disabled={(!choisie && plein) || undefined}
                  onClick={() => basculer(m.id)}
                >
                  <span className={`rang ${choisie ? "" : "rang-vide"}`} aria-hidden="true">
                    {choisie ? rang + 1 : "+"}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="axe">{m.axe}</span>
                    <span>{m.texte}</span>
                    <span className="text-[13px] text-secondaire">
                      <span className="sr-only">{T.sources}, </span>
                      {m.sources.map((s) => (
                        <span key={s.organisme} className="block">
                          {formaterSource(s)}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
                {m.detail && (
                  <>
                    <button
                      type="button"
                      className="bouton bouton-discret bouton-petit self-start"
                      aria-expanded={ouvert}
                      aria-controls={`detail-${m.id}`}
                      onClick={() =>
                        setOuverts((o) => {
                          const n = new Set(o);
                          if (n.has(m.id)) n.delete(m.id);
                          else n.add(m.id);
                          return n;
                        })
                      }
                    >
                      {T.details}
                      <span className="sr-only">, {m.texte}</span>
                    </button>
                    <p id={`detail-${m.id}`} className="aide px-3" hidden={!ouvert}>
                      {m.detail}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-bordure-forte bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <a
          href="#mon-classement"
          className="flex min-h-11 items-center justify-between gap-3 font-semibold no-underline"
        >
          <span>{T.resume(valeur.length, N)}</span>
          <span className="text-accent">{T.voirClassement}</span>
        </a>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {annonce}
      </p>
    </div>
  );
}
