/** Champs de formulaire accessibles : étiquette, aide, erreur annoncée et reliée au champ. */
import type { ReactNode } from "react";
import { NE_PAS_REPONDRE, type Option } from "@/lib/formulaires";

export function Erreur({ id, message }: { id: string; message?: string | undefined }) {
  return (
    <p id={id} className="erreur" role={message ? "alert" : undefined} hidden={!message}>
      {message}
    </p>
  );
}

const decrit = (...ids: (string | false | undefined)[]) =>
  ids.filter(Boolean).join(" ") || undefined;

type Base = {
  nom: string;
  libelle: string;
  aide?: string | undefined;
  erreur?: string | undefined;
  facultatif?: boolean;
};

export function ChoixUnique({
  nom,
  libelle,
  aide,
  erreur,
  options,
  valeur,
  onChange,
  nsp = false,
  colonnes = false,
  facultatif,
}: Base & {
  options: readonly Option[];
  valeur: string | null;
  onChange: (v: string) => void;
  nsp?: boolean;
  colonnes?: boolean;
}) {
  const liste = nsp ? [...options, NE_PAS_REPONDRE] : options;
  return (
    <fieldset
      id={`champ-${nom}`}
      aria-describedby={decrit(aide && `${nom}-aide`, erreur && `${nom}-erreur`)}
      aria-invalid={erreur ? true : undefined}
    >
      <legend>
        {libelle}
        {facultatif && <span className="aide font-normal"> (facultatif)</span>}
      </legend>
      {aide && (
        <p id={`${nom}-aide`} className="aide">
          {aide}
        </p>
      )}
      <div className={`choix-liste ${colonnes ? "deux-colonnes" : ""}`}>
        {liste.map((o) => (
          <label
            key={o.valeur}
            className={`choix ${o.valeur === NE_PAS_REPONDRE.valeur && nsp ? "nsp" : ""}`}
          >
            <input
              type="radio"
              name={nom}
              value={o.valeur}
              checked={valeur === o.valeur}
              onChange={() => onChange(o.valeur)}
            />
            <span>{o.libelle}</span>
          </label>
        ))}
      </div>
      <Erreur id={`${nom}-erreur`} message={erreur} />
    </fieldset>
  );
}

export function ChoixMultiple({
  nom,
  libelle,
  aide,
  erreur,
  options,
  valeurs,
  onChange,
  nsp = false,
  colonnes = false,
  facultatif,
  apres,
  max,
}: Base & {
  options: readonly Option[];
  valeurs: readonly string[];
  onChange: (v: string[]) => void;
  nsp?: boolean;
  colonnes?: boolean;
  apres?: ReactNode;
  /** Nombre de choix au plus. Au delà, les cases restent focalisables (aria-disabled) mais ne se cochent pas. */
  max?: number;
}) {
  const liste = nsp ? [...options, NE_PAS_REPONDRE] : options;
  const plein = max !== undefined && valeurs.length >= max;
  const basculer = (v: string) => {
    if (v === NE_PAS_REPONDRE.valeur) return onChange(valeurs.includes(v) ? [] : [v]);
    if (plein && !valeurs.includes(v)) return;
    const sans = valeurs.filter((x) => x !== NE_PAS_REPONDRE.valeur);
    onChange(sans.includes(v) ? sans.filter((x) => x !== v) : [...sans, v]);
  };
  return (
    <fieldset
      id={`champ-${nom}`}
      aria-describedby={decrit(aide && `${nom}-aide`, erreur && `${nom}-erreur`)}
      aria-invalid={erreur ? true : undefined}
    >
      <legend>
        {libelle}
        {facultatif && <span className="aide font-normal"> (facultatif)</span>}
      </legend>
      {aide && (
        <p id={`${nom}-aide`} className="aide">
          {aide}
        </p>
      )}
      <div className={`choix-liste ${colonnes ? "deux-colonnes" : ""}`}>
        {liste.map((o) => (
          <label
            key={o.valeur}
            className={`choix ${o.valeur === NE_PAS_REPONDRE.valeur ? "nsp" : ""}`}
          >
            <input
              type="checkbox"
              name={nom}
              value={o.valeur}
              checked={valeurs.includes(o.valeur)}
              aria-disabled={(plein && !valeurs.includes(o.valeur)) || undefined}
              onChange={() => basculer(o.valeur)}
            />
            <span>{o.libelle}</span>
          </label>
        ))}
      </div>
      {apres}
      <Erreur id={`${nom}-erreur`} message={erreur} />
    </fieldset>
  );
}

export function Texte({
  nom,
  libelle,
  aide,
  erreur,
  valeur,
  onChange,
  type = "text",
  autoComplete,
  facultatif,
  max,
  multiligne = false,
  apres,
}: Base & {
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  max?: number;
  multiligne?: boolean;
  apres?: ReactNode;
}) {
  const props = {
    id: `champ-${nom}`,
    name: nom,
    value: valeur,
    className: "saisie",
    maxLength: max,
    "aria-invalid": erreur ? true : undefined,
    "aria-required": facultatif ? undefined : true,
    "aria-describedby": decrit(
      aide && `${nom}-aide`,
      !!max && multiligne && `${nom}-compteur`,
      erreur && `${nom}-erreur`,
    ),
  };
  return (
    <div className="champ">
      <label htmlFor={`champ-${nom}`} className="etiquette">
        {libelle}
        {facultatif ? (
          <span className="aide font-normal"> (facultatif)</span>
        ) : (
          <span className="aide font-normal"> (obligatoire)</span>
        )}
      </label>
      {aide && (
        <p id={`${nom}-aide`} className="aide">
          {aide}
        </p>
      )}
      {multiligne ? (
        <textarea {...props} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          {...props}
          type={type}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {max && multiligne && (
        <p id={`${nom}-compteur`} className="aide text-right" aria-live="polite">
          {valeur.length} sur {max.toLocaleString("fr-FR")} caractères
        </p>
      )}
      {apres}
      <Erreur id={`${nom}-erreur`} message={erreur} />
    </div>
  );
}

export function CaseACocher({
  nom,
  libelle,
  erreur,
  coche,
  onChange,
  obligatoire = false,
}: {
  nom: string;
  libelle: string;
  erreur?: string | undefined;
  coche: boolean;
  onChange: (v: boolean) => void;
  obligatoire?: boolean;
}) {
  return (
    <div className="champ">
      <label className="choix">
        <input
          id={`champ-${nom}`}
          type="checkbox"
          name={nom}
          checked={coche}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={erreur ? true : undefined}
          aria-required={obligatoire || undefined}
          aria-describedby={erreur ? `${nom}-erreur` : undefined}
        />
        <span>
          {libelle}
          {obligatoire && <span className="aide"> (obligatoire)</span>}
        </span>
      </label>
      <Erreur id={`${nom}-erreur`} message={erreur} />
    </div>
  );
}

/** Champ piège invisible : les personnes ne le voient pas, les robots le remplissent. */
export function ChampPiege({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="piege" aria-hidden="true">
      <label htmlFor="site-web">Ne pas remplir ce champ</label>
      <input
        id="site-web"
        name="site_web"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Récapitulatif des erreurs en tête de formulaire, focalisé à l'envoi. */
export function ResumeErreurs({
  message,
  erreurs,
  libelles,
  refFocus,
}: {
  message: string;
  erreurs: Record<string, string>;
  libelles: Record<string, string>;
  refFocus?: (el: HTMLDivElement | null) => void;
}) {
  const cles = Object.keys(erreurs);
  return (
    <div ref={refFocus} tabIndex={-1} className="encadre-erreur" role="alert">
      <p className="font-bold text-erreur">{message}</p>
      {cles.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {cles.map((c) => (
            <li key={c}>
              <a href={`#champ-${c}`}>
                {libelles[c] ?? c}, {erreurs[c]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
