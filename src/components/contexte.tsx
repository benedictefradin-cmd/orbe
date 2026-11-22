import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CHIFFRES, CONTEXTE } from "@/lib/contenus";

type Etat = "fixe" | "attente" | "visible";

/**
 * Déclenche une animation quand l'élément entre à l'écran.
 * Le rendu serveur et le mouvement réduit gardent l'état final (« fixe »),
 * un élément déjà visible au chargement ne bouge pas.
 */
function useApparition<T extends Element>() {
  const ref = useRef<T>(null);
  const [etat, setEtat] = useState<Etat>("fixe");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    setEtat("attente");
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setEtat("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, etat] as const;
}

/** « 160 000 » → 160000 et « », « 77 % » → 77 et « % », « 1 sur 10 » → 1 et « sur 10 ». */
function decouper(valeur: string) {
  const m = /^(\d[\d ]*\d|\d)\s*(.*)$/.exec(valeur);
  if (!m) return null;
  return { nombre: Number(m[1]!.replace(/ /g, "")), unite: m[2] ?? "" };
}

const formater = (n: number) => n.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");

function Compteur({ nombre, etat, delai }: { nombre: number; etat: Etat; delai: number }) {
  const [courant, setCourant] = useState(nombre);
  useEffect(() => {
    if (etat === "attente") setCourant(0);
    if (etat !== "visible" || nombre < 10) return;
    let image = 0;
    const duree = 1600;
    const debut = performance.now() + delai;
    const pas = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - debut) / duree));
      setCourant(Math.round(nombre * (1 - Math.pow(1 - p, 4))));
      if (p < 1) image = requestAnimationFrame(pas);
    };
    image = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(image);
  }, [etat, nombre, delai]);
  return <>{formater(nombre < 10 ? nombre : courant)}</>;
}

function Visuel({ nombre, unite }: { nombre: number; unite: string }) {
  if (unite === "%") {
    return (
      <div className="chiffre-jauge" aria-hidden="true">
        <span style={{ "--part": nombre / 100 } as CSSProperties} />
      </div>
    );
  }
  const surTotal = /^sur (\d+)$/.exec(unite);
  if (surTotal) {
    const total = Number(surTotal[1]);
    return (
      <div className="chiffre-points" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={i < nombre ? "actif" : undefined}
            style={{ "--j": i } as CSSProperties}
          />
        ))}
      </div>
    );
  }
  return null;
}

export function ChiffresCles() {
  const [ref, etat] = useApparition<HTMLUListElement>();
  return (
    <section className="section section-chiffres" aria-labelledby="chiffres-titre">
      <div className="conteneur">
        <h2 id="chiffres-titre" className="titre-section">
          {CONTEXTE.chiffresTitre}
        </h2>
        <ul ref={ref} className="chiffres-liste" data-etat={etat}>
          {CHIFFRES.map((c, i) => {
            const d = decouper(c.valeur);
            return (
              <li key={c.valeur} style={{ "--i": i } as CSSProperties}>
                <p className="chiffre-valeur">
                  <span className="sr-only">{c.valeur}</span>
                  <span aria-hidden="true">
                    {d ? <Compteur nombre={d.nombre} etat={etat} delai={i * 120} /> : c.valeur}
                    {d?.unite && <span className="chiffre-unite"> {d.unite}</span>}
                  </span>
                </p>
                {d && <Visuel nombre={d.nombre} unite={d.unite} />}
                <p className="chiffre-texte">{c.texte}</p>
                <p className="chiffre-source">{c.source}</p>
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

export function Frise() {
  const dernier = CONTEXTE.frise.length - 1;
  return (
    <>
      <ol className="frise">
        {CONTEXTE.frise.map((e, i) => {
          const { jour, annee } = decouperDate(e.date);
          const courant = i === dernier;
          return (
            <li key={e.date} className={`frise-item ${courant ? "frise-courant" : ""}`}>
              <p className="frise-date">
                <time>
                  <span className="frise-jour">{jour}</span>{" "}
                  <span className="frise-annee">{annee}</span>
                </time>
                {courant && <span className="frise-badge">{CONTEXTE.friseEnCours}</span>}
              </p>
              <span className="frise-repere" aria-hidden="true">
                <span className="frise-point" />
              </span>
              <p className="frise-texte">{e.texte}</p>
            </li>
          );
        })}
      </ol>
      <p className="frise-conclusion">{CONTEXTE.encadre}</p>
    </>
  );
}
