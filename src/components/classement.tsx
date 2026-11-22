/**
 * Classement des mesures : on touche une mesure pour l'ajouter, on change l'ordre avec des boutons. Clavier et doigt.
 * L'ordre de présentation est tiré par le parent une seule fois par visite, et gardé au retour sur l'étape.
 * Aucun bouton n'est jamais désactivé (disabled) : aria-disabled garde le focus là où il est.
 */
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { CONSULTATION } from "@/lib/contenus";
import { AXES, formaterSource, mesureParId, type Mesure } from "@/lib/mesures";
import { NOMBRE_MESURES_A_CLASSER } from "@/lib/config";
import { Marque } from "@/components/ui/trait";

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
  const liste = useRef<HTMLOListElement>(null);
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

  /** Monter, descendre, retirer : les lignes glissent à leur nouvelle place (transition de vue, motion.css). */
  const glisser = (maj: () => void) => {
    const racine = document.documentElement;
    if (
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return maj();
    const lignes = liste.current?.querySelectorAll<HTMLElement>("[data-mesure]") ?? [];
    racine.dataset["transition"] = "classement";
    lignes.forEach((li) => (li.style.viewTransitionName = `mesure-${li.dataset["mesure"]}`));
    const transition = document.startViewTransition(() => flushSync(maj));
    void transition.finished.finally(() => {
      liste.current
        ?.querySelectorAll<HTMLElement>("[data-mesure]")
        .forEach((li) => (li.style.viewTransitionName = ""));
      delete racine.dataset["transition"];
    });
  };

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
    glisser(() => onChange(copie));
    setAnnonce(T.annonces.deplacement(j + 1, N, texte(valeur[i]!)));
  };

  const retirer = (i: number) => {
    const id = valeur[i]!;
    const suivant = valeur[i + 1];
    focusApres.current = suivant ? `retirer-${suivant}` : "titre";
    glisser(() => onChange(valeur.filter((x) => x !== id)));
    setAnnonce(T.annonces.retrait(texte(id)));
  };

  const mesures = (ordre ?? []).map((id) => mesureParId(id)).filter((m): m is Mesure => !!m);
  const visibles = axe ? mesures.filter((m) => m.axe === axe) : mesures;

  return (
    <div
      id="champ-classement"
      className="classement"
      tabIndex={-1}
      aria-describedby={erreur ? "classement-erreur" : undefined}
    >
      <div className="classement-intro">
        <p className="texte-long">{T.intro}</p>
        <p className="aide mt-2">{T.aide}</p>
      </div>

      <section className="classement-choix" aria-labelledby="mon-classement">
        <h3 id="mon-classement" ref={titre} tabIndex={-1} className="classement-titre outline-none">
          {T.titreClassement(valeur.length, N)}
        </h3>
        <ol className="rangs" ref={liste} data-motion="classement">
          {valeur.map((id, i) => {
            const m = mesureParId(id)!;
            const premier = i === 0;
            const dernier = i === valeur.length - 1;
            return (
              <li key={id} data-mesure={id}>
                <span className="rang" aria-hidden="true">
                  <Marque geste="entourer" motion="rang">
                    {i + 1}
                  </Marque>
                </span>
                <span className="rangs-texte">
                  <span className="sr-only">Position {i + 1}, </span>
                  {m.texte}
                </span>
                <div className="rangs-actions">
                  <button
                    ref={ref(`monter-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit bouton-icone"
                    onClick={() => deplacer(i, -1, "monter")}
                    aria-disabled={premier || undefined}
                    aria-label={`${T.monter}, ${m.texte}`}
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                  <button
                    ref={ref(`descendre-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit bouton-icone"
                    onClick={() => deplacer(i, 1, "descendre")}
                    aria-disabled={dernier || undefined}
                    aria-label={`${T.descendre}, ${m.texte}`}
                  >
                    <ArrowDown size={18} aria-hidden="true" />
                  </button>
                  <button
                    ref={ref(`retirer-${id}`)}
                    type="button"
                    className="bouton bouton-discret bouton-petit bouton-icone"
                    onClick={() => retirer(i)}
                    aria-label={`${T.retirer}, ${m.texte}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        {/* Les rangs encore libres : une ligne de cases réglées, comme sur un bulletin. */}
        {valeur.length < N && (
          <div className="cases-vides">
            {Array.from({ length: N - valeur.length }, (_, k) => (
              <span key={k} className="case-rang" aria-hidden="true">
                {valeur.length + k + 1}
              </span>
            ))}
            {valeur.length === 0 && <p className="meta ml-1 self-center">{T.vide}</p>}
          </div>
        )}
        {plein && <p className="mt-3 font-titre font-semibold text-navy">{T.complet}</p>}
        {erreur && (
          <p id="classement-erreur" className="erreur mt-3" role="alert">
            {erreur}
          </p>
        )}
      </section>

      <div className="classement-liste">
        <h3 className="titre-bloc">{T.titreListe}</h3>
        <p className="aide mt-1">{T.ordre}</p>

        {/* Filtres : ils masquent des mesures sans jamais changer l'ordre tiré. */}
        <div className="mt-3" role="group" aria-labelledby="filtres-axes">
          <p id="filtres-axes" className="meta">
            {T.filtres}
          </p>
          <div className="filtres">
            {[null, ...AXES].map((a) => (
              <button
                key={a ?? "tous"}
                type="button"
                className="filtre"
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
          <ul className="mesures">
            {visibles.map((m) => {
              const rang = valeur.indexOf(m.id);
              const choisie = rang >= 0;
              const ouvert = ouverts.has(m.id);
              // Numéro de bulletin, d'après l'ordre tiré : il ne change pas quand on filtre.
              const numero = String(mesures.indexOf(m) + 1).padStart(2, "0");
              return (
                <li key={m.id} className="mesure-carte">
                  <button
                    type="button"
                    className="mesure"
                    aria-pressed={choisie}
                    aria-disabled={(!choisie && plein) || undefined}
                    onClick={() => basculer(m.id)}
                  >
                    <span className="mesure-meta">
                      <span className="mesure-num" aria-hidden="true">
                        {numero}
                      </span>
                      <span className="axe">{m.axe}</span>
                      <span className="mesure-case" aria-hidden="true">
                        {choisie ? (
                          <span className="rang">
                            <Marque geste="entourer" motion="rang">
                              {rang + 1}
                            </Marque>
                          </span>
                        ) : (
                          <span className="mesure-case-vide" />
                        )}
                      </span>
                    </span>
                    <span className="mesure-texte">{m.texte}</span>
                  </button>
                  <details className="sources">
                    <summary>
                      {T.sources}
                      <span className="sr-only">, {m.texte}</span>
                    </summary>
                    <div className="sources-contenu">
                      {m.sources.map((s) => (
                        <p key={s.organisme}>{formaterSource(s)}</p>
                      ))}
                    </div>
                  </details>
                  {m.detail && (
                    <div className="px-3 pb-2">
                      <button
                        type="button"
                        className="bouton bouton-discret bouton-petit -ml-3"
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
                      <p id={`detail-${m.id}`} className="aide" hidden={!ouvert}>
                        {m.detail}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {annonce}
      </p>
    </div>
  );
}
