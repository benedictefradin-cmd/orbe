/** Tableau de bord animé, sur le modèle du Fox Friday. Deux onglets, Ateliers et Consultation. */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BellRing,
  CalendarCheck,
  Check,
  Copy,
  Info,
  ListChecks,
  Mail,
  Timer,
  Trophy,
  UserMinus,
  Users,
} from "lucide-react";
import {
  ATELIERS,
  CAPACITE_PAR_ATELIER,
  FERMETURE_INSCRIPTIONS,
  FUSEAU,
  formaterCreneau,
  jourParis,
  NOMBRE_MESURES_A_CLASSER,
  type AtelierId,
} from "@/lib/config";
import { libelle, Q, SITUATIONS_ATELIER, type Option } from "@/lib/formulaires";
import { agregerClassement } from "@/lib/mesures";
import {
  adressesInscrits,
  repartition,
  statsAteliers,
  statsConsultation,
} from "@/lib/statistiques";
import { STATUTS } from "@/lib/exports";
import type { DonneesAdmin, InscriptionAdmin } from "@/lib/server/services.server";

export function useCompteur(cible: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(cible);
      return;
    }
    let raf = 0;
    const debut = performance.now();
    const depart = 0;
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / ms);
      setV(Math.round(depart + (cible - depart) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [cible, ms]);
  return v;
}

const retard = (i: number) => ({ animationDelay: `${i * 60}ms` }) as CSSProperties;
const jourCourt = (j: string) =>
  new Date(`${j}T12:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

function Indicateur({
  icone,
  titre,
  valeur,
  sous,
  i,
}: {
  icone: ReactNode;
  titre: string;
  valeur: number;
  sous?: string;
  i: number;
}) {
  const n = useCompteur(valeur);
  return (
    <div className="dash-carte" style={retard(i)}>
      <div className="dash-libelle">
        {icone}
        {titre}
      </div>
      <div className="dash-nombre" aria-label={`${valeur}`}>
        {n}
      </div>
      {sous && <div className="dash-sous">{sous}</div>}
    </div>
  );
}

function Jauge({
  titre,
  valeur,
  max,
  attente,
  i,
}: {
  titre: string;
  valeur: number;
  max: number | null;
  attente: number;
  i: number;
}) {
  const n = useCompteur(valeur);
  const pct = max ? Math.min(100, (valeur / max) * 100) : 0;
  const plein = max !== null && valeur >= max;
  return (
    <div className="dash-carte" style={retard(i)}>
      <div className="flex items-start justify-between gap-2">
        <div className="dash-libelle">{titre}</div>
        {plein && <span className="badge badge-plein">Complet</span>}
      </div>
      <div className="dash-nombre">
        {n}
        <span className="text-xl text-secondaire"> {max !== null ? `sur ${max}` : "inscrits"}</span>
      </div>
      {max !== null && (
        <div
          className="dash-piste mt-3"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={valeur}
          aria-label={`${titre}, ${valeur} inscrits sur ${max}`}
        >
          <div
            className={`dash-remplissage ${plein ? "plein" : ""}`}
            style={{ width: `${pct}%`, ...retard(i) }}
          />
        </div>
      )}
      <div className="dash-sous mt-2">{attente} en liste d'attente</div>
    </div>
  );
}

function CompteARebours({ maintenant }: { maintenant: string }) {
  const [now, setNow] = useState(() => new Date(maintenant).getTime());
  useEffect(() => {
    setNow(new Date(maintenant).getTime());
    const t = setInterval(() => setNow((x) => x + 1000), 1000);
    return () => clearInterval(t);
  }, [maintenant]);
  const reste = FERMETURE_INSCRIPTIONS.getTime() - now;
  const j = Math.floor(reste / 86_400_000),
    h = Math.floor((reste % 86_400_000) / 3_600_000),
    m = Math.floor((reste % 3_600_000) / 60_000);
  return (
    <div className="dash-carte" style={retard(5)}>
      <div className="dash-libelle">
        <Timer size={14} aria-hidden="true" />
        Fermeture des inscriptions
      </div>
      {reste > 0 ? (
        <div className="dash-nombre">
          {j} j {h} h {m} min
        </div>
      ) : (
        <div className="dash-nombre">Fermées</div>
      )}
      <div className="dash-sous">
        Le{" "}
        {FERMETURE_INSCRIPTIONS.toLocaleString("fr-FR", {
          timeZone: FUSEAU,
          dateStyle: "full",
          timeStyle: "short",
        })}
      </div>
    </div>
  );
}

/** Une seule série par graphique : couleur d'accent, pas de légende, info bulle au survol. */
function CourbeParJour({
  titre,
  donnees,
  unite,
}: {
  titre: string;
  donnees: { jour: string; n: number }[];
  unite: string;
}) {
  return (
    <div className="dash-carte" style={retard(7)}>
      <div className="dash-libelle">{titre}</div>
      {donnees.length ? (
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={donnees.map((d) => ({ ...d, libelle: jourCourt(d.jour) }))}
              margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
            >
              <CartesianGrid vertical={false} stroke="#E5EAF2" />
              <XAxis
                dataKey="libelle"
                tick={{ fill: "#5A6B85", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#D1D9E6" }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#5A6B85", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#E8EFFE" }}
                formatter={(v: number) => [`${v} ${unite}`, ""]}
                labelStyle={{ color: "#0F1E3D", fontWeight: 700 }}
                contentStyle={{ borderRadius: 8, borderColor: "#D1D9E6" }}
                separator=""
              />
              <Bar dataKey="n" fill="#2D5BD7" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="dash-sous mt-3">Pas encore de données.</p>
      )}
      {donnees.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-accent">Voir les chiffres</summary>
          <table className="tableau mt-2">
            <thead>
              <tr>
                <th>Jour</th>
                <th>{unite}</th>
              </tr>
            </thead>
            <tbody>
              {donnees.map((d) => (
                <tr key={d.jour}>
                  <td>{jourCourt(d.jour)}</td>
                  <td>{d.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

function Repartition({
  titre,
  valeurs,
  options,
  i,
}: {
  titre: string;
  valeurs: string[];
  options?: readonly Option[];
  i: number;
}) {
  const lignes = repartition(valeurs);
  const max = Math.max(1, ...lignes.map((l) => l.n));
  return (
    <div className="dash-carte" style={retard(i)}>
      <div className="dash-libelle">{titre}</div>
      {lignes.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {lignes.map((l) => (
            <li
              key={l.valeur}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm"
            >
              <span className="truncate" title={options ? libelle(options, l.valeur) : l.valeur}>
                {options ? libelle(options, l.valeur) : l.valeur}
              </span>
              <span className="font-semibold tabular-nums">{l.n}</span>
              <div className="dash-piste col-span-2 h-2">
                <div className="dash-remplissage" style={{ width: `${(l.n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-sous mt-3">Pas encore de données.</p>
      )}
    </div>
  );
}

/* ───────────── Onglet Ateliers ───────────── */

type Actions = {
  cocher: (
    inscription: string,
    atelier: AtelierId,
    champ: "lien_visio" | "present" | "prevenu",
    valeur: boolean,
  ) => Promise<void>;
  commenter: (inscription: string, texte: string) => Promise<void>;
  annuler: (inscription: string, atelier: AtelierId | null, nom: string) => Promise<void>;
};

const AIDE_STATUT: Record<string, string> = {
  inscrit: "A une place pour cet atelier. Le lien de visio est à lui envoyer.",
  liste_attente:
    "Atelier complet. Monte automatiquement, dans l'ordre d'arrivée, dès qu'une place se libère.",
  annule: "Inscription annulée par la personne ou par vous. Rien n'est supprimé.",
};

export function OngletAteliers({ donnees, actions }: { donnees: DonneesAdmin; actions: Actions }) {
  const s = useMemo(() => statsAteliers(donnees.inscriptions), [donnees.inscriptions]);
  const [recherche, setRecherche] = useState("");
  const [filtreAtelier, setFiltreAtelier] = useState<"tous" | AtelierId>("tous");
  const [filtreStatut, setFiltreStatut] = useState<"tous" | "inscrit" | "liste_attente" | "annule">(
    "tous",
  );
  const [copie, setCopie] = useState<string | null>(null);

  const lignes = donnees.inscriptions
    .flatMap((i) => i.dates.map((d) => ({ i, d })))
    .filter(({ d }) => filtreAtelier === "tous" || d.atelier_id === filtreAtelier)
    .filter(({ d }) => filtreStatut === "tous" || d.statut === filtreStatut)
    .filter(({ i }) =>
      `${i.prenom} ${i.nom} ${i.email} ${i.structure ?? ""}`
        .toLowerCase()
        .includes(recherche.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        a.d.atelier_id.localeCompare(b.d.atelier_id) || a.d.cree_le.localeCompare(b.d.cree_le),
    );

  const copier = async (atelier: AtelierId) => {
    const adresses = adressesInscrits(donnees.inscriptions, atelier);
    try {
      await navigator.clipboard.writeText(adresses.join(", "));
      setCopie(atelier);
      setTimeout(() => setCopie(null), 2500);
    } catch {
      window.prompt("Copiez les adresses", adresses.join(", "));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicateur
          i={0}
          icone={<Users size={14} aria-hidden="true" />}
          titre="Inscrits"
          valeur={s.inscrits}
          sous={`${s.personnesActives} personnes, toutes dates`}
        />
        <Indicateur
          i={1}
          icone={<ListChecks size={14} aria-hidden="true" />}
          titre="Liste d'attente"
          valeur={s.attente}
        />
        <Indicateur
          i={2}
          icone={<UserMinus size={14} aria-hidden="true" />}
          titre="Annulations"
          valeur={s.annulations}
        />
        <Indicateur
          i={3}
          icone={<CalendarCheck size={14} aria-hidden="true" />}
          titre="Inscrits aux deux dates"
          valeur={s.deuxDates}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {s.parAtelier.map((a, k) => {
          const place = donnees.places.find((p) => p.atelier_id === a.atelier.id);
          return (
            <Jauge
              key={a.atelier.id}
              i={4 + k}
              titre={`Atelier ${a.atelier.numero}, ${a.atelier.titre}`}
              valeur={a.inscrits}
              max={
                place?.capacite ??
                (CAPACITE_PAR_ATELIER === "illimité" ? null : CAPACITE_PAR_ATELIER)
              }
              attente={a.attente}
            />
          );
        })}
        <CompteARebours maintenant={donnees.maintenant} />
      </div>

      {s.aPrevenir.length > 0 && (
        <section className="dash-carte border-2 border-accent" aria-labelledby="a-prevenir">
          <h2 id="a-prevenir" className="dash-libelle text-accent-survol">
            <BellRing size={14} aria-hidden="true" />À prévenir, sorties de la liste d'attente
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {s.aPrevenir.map((d) => {
              const a = ATELIERS.find((x) => x.id === d.atelier_id)!;
              const sujet = `Atelier ${a.numero}, une place s'est libérée pour vous`;
              const corps = `Bonjour ${d.personne.prenom},\n\nUne place s'est libérée pour l'atelier ${a.numero}, ${a.titre}, le ${formaterCreneau(a.debut, a.fin, true)}. Votre inscription est confirmée.\n\nSi vous ne pouvez plus venir, vous pouvez libérer votre place ici ${window.location.origin}/annuler/${d.personne.jeton_annulation}\n\nÀ bientôt,\nL'Institut Rousseau et Face à l'inceste`;
              return (
                <li
                  key={`${d.personne.id}${d.atelier_id}`}
                  className="flex flex-col gap-2 rounded-lg bg-accent-pale p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <strong>
                      {d.personne.prenom} {d.personne.nom}
                    </strong>
                    , atelier {a.numero}
                    <span className="dash-sous block">{d.personne.email}</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <a
                      className="bouton bouton-contour bouton-petit"
                      href={`mailto:${d.personne.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`}
                    >
                      <Mail size={16} aria-hidden="true" />
                      Écrire
                    </a>
                    <button
                      type="button"
                      className="bouton bouton-plein bouton-petit"
                      onClick={() =>
                        void actions.cocher(
                          d.personne.id,
                          d.atelier_id as AtelierId,
                          "prevenu",
                          true,
                        )
                      }
                    >
                      <Check size={16} aria-hidden="true" />
                      Prévenue
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourbeParJour titre="Inscriptions par jour" donnees={s.parJour} unite="inscriptions" />
        </div>
        <div className="dash-carte" style={retard(8)}>
          <div className="dash-libelle">
            <Mail size={14} aria-hidden="true" />
            Adresses pour la copie cachée
          </div>
          <p className="dash-sous mt-2">Inscrits uniquement, sans annulés ni liste d'attente.</p>
          <div className="mt-3 flex flex-col gap-2">
            {ATELIERS.map((a) => (
              <button
                key={a.id}
                type="button"
                className="bouton bouton-contour bouton-petit justify-start"
                onClick={() => void copier(a.id)}
              >
                {copie === a.id ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                {copie === a.id ? "Adresses copiées" : `Copier les adresses, atelier ${a.numero}`} (
                {adressesInscrits(donnees.inscriptions, a.id).length})
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">
            {copie ? "Adresses copiées" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Repartition
          i={9}
          titre="Situations"
          valeurs={donnees.inscriptions
            .filter((i) => i.dates.some((d) => d.statut !== "annule"))
            .flatMap((i) => i.situations)}
          options={SITUATIONS_ATELIER}
        />
        <Repartition
          i={10}
          titre="Structures"
          valeurs={donnees.inscriptions
            .filter((i) => i.dates.some((d) => d.statut !== "annule"))
            .map((i) => i.structure?.trim() || "Sans structure")}
        />
      </div>

      <section className="dash-carte" aria-labelledby="liste-inscrits">
        <h2 id="liste-inscrits" className="dash-libelle">
          Inscrits, {lignes.length} lignes
        </h2>
        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <label className="sr-only" htmlFor="recherche">
            Rechercher
          </label>
          <input
            id="recherche"
            className="saisie md:flex-1"
            placeholder="Rechercher un nom, un email, une structure"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <label className="sr-only" htmlFor="filtre-atelier">
            Filtrer par atelier
          </label>
          <select
            id="filtre-atelier"
            className="saisie md:w-48"
            value={filtreAtelier}
            onChange={(e) => setFiltreAtelier(e.target.value as typeof filtreAtelier)}
          >
            <option value="tous">Tous les ateliers</option>
            {ATELIERS.map((a) => (
              <option key={a.id} value={a.id}>
                Atelier {a.numero}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filtre-statut">
            Filtrer par statut
          </label>
          <select
            id="filtre-statut"
            className="saisie md:w-48"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as typeof filtreStatut)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="inscrit">Inscrits</option>
            <option value="liste_attente">Liste d'attente</option>
            <option value="annule">Annulés</option>
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="tableau min-w-[880px]">
            <thead>
              <tr>
                {[
                  "Atelier",
                  "Personne",
                  "Statut",
                  "Inscrit le",
                  "Lien visio envoyé",
                  "Présent",
                  "Commentaire",
                  "",
                ].map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map(({ i, d }) => (
                <LigneInscrit key={`${i.id}${d.atelier_id}`} i={i} d={d} actions={actions} />
              ))}
            </tbody>
          </table>
          {lignes.length === 0 && (
            <p className="dash-sous py-6">Aucune inscription ne correspond.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function LigneInscrit({
  i,
  d,
  actions,
}: {
  i: InscriptionAdmin;
  d: InscriptionAdmin["dates"][number];
  actions: Actions;
}) {
  const a = ATELIERS.find((x) => x.id === d.atelier_id)!;
  const date = (v: string | null) =>
    v
      ? new Date(v).toLocaleString("fr-FR", {
          timeZone: FUSEAU,
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  const nom = `${i.prenom} ${i.nom}`;
  return (
    <tr>
      <td className="whitespace-nowrap">Atelier {a.numero}</td>
      <td>
        <strong>{nom}</strong>
        <span className="dash-sous block">{i.email}</span>
        {i.structure && <span className="dash-sous block">{i.structure}</span>}
        {i.accessibilite && (
          <span className="badge mt-1" title={i.accessibilite}>
            Accessibilité
          </span>
        )}
      </td>
      <td>
        <span
          className={`badge ${d.statut === "liste_attente" ? "badge-attente" : d.statut === "annule" ? "badge-annule" : ""}`}
          title={AIDE_STATUT[d.statut]}
        >
          {STATUTS[d.statut]}
          <Info size={12} aria-hidden="true" />
          <span className="sr-only">, {AIDE_STATUT[d.statut]}</span>
        </span>
        {d.promu_le && (
          <span className="dash-sous block">sorti de la liste le {date(d.promu_le)}</span>
        )}
        {d.annule_le && (
          <span className="dash-sous block">
            le {date(d.annule_le)},{" "}
            {d.annule_par === "organisatrice" ? "par vous" : "par la personne"}
          </span>
        )}
      </td>
      <td className="whitespace-nowrap">{date(i.cree_le)}</td>
      <td>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[#2D5BD7]"
            checked={!!d.lien_visio_envoye_le}
            disabled={d.statut !== "inscrit"}
            onChange={(e) => void actions.cocher(i.id, a.id, "lien_visio", e.target.checked)}
          />
          <span className="sr-only">Lien de visio envoyé à {nom}</span>
          {d.lien_visio_envoye_le ? date(d.lien_visio_envoye_le) : ""}
        </label>
      </td>
      <td>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[#2D5BD7]"
            checked={!!d.present_le}
            disabled={d.statut !== "inscrit"}
            onChange={(e) => void actions.cocher(i.id, a.id, "present", e.target.checked)}
          />
          <span className="sr-only">{nom} présent le jour J</span>
        </label>
      </td>
      <td>
        <textarea
          key={i.commentaire ?? ""}
          defaultValue={i.commentaire ?? ""}
          rows={1}
          maxLength={1000}
          placeholder="Commentaire"
          aria-label={`Commentaire interne pour ${nom}`}
          className="saisie min-h-11 w-44 py-2 text-sm"
          onBlur={(e) => {
            if (e.target.value !== (i.commentaire ?? ""))
              void actions.commenter(i.id, e.target.value);
          }}
        />
      </td>
      <td>
        {d.statut !== "annule" && (
          <button
            type="button"
            className="bouton bouton-discret bouton-petit"
            onClick={() => void actions.annuler(i.id, a.id, nom)}
          >
            Annuler
            <span className="sr-only">
              {" "}
              l'inscription de {nom} à l'atelier {a.numero}
            </span>
          </button>
        )}
      </td>
    </tr>
  );
}

/* ───────────── Onglet Consultation ───────────── */

export function OngletConsultation({ donnees }: { donnees: DonneesAdmin }) {
  const aujourdhui = jourParis(donnees.maintenant);
  const s = useMemo(
    () => statsConsultation(donnees.reponses, aujourdhui),
    [donnees.reponses, aujourdhui],
  );
  const classement = useMemo(
    () =>
      agregerClassement(
        donnees.reponses.map((r) => r.classement),
        NOMBRE_MESURES_A_CLASSER,
      ),
    [donnees.reponses],
  );
  const maxPoints = Math.max(1, ...classement.map((c) => c.points));
  const r = donnees.reponses;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Indicateur
          i={0}
          icone={<Users size={14} aria-hidden="true" />}
          titre="Réponses complètes"
          valeur={s.total}
        />
        <Indicateur
          i={1}
          icone={<CalendarCheck size={14} aria-hidden="true" />}
          titre="Réponses du jour"
          valeur={s.duJour}
        />
      </div>
      <CourbeParJour titre="Réponses par jour" donnees={s.parJour} unite="réponses" />

      <section className="dash-carte" aria-labelledby="classement-direct">
        <h2 id="classement-direct" className="dash-libelle">
          <Trophy size={14} aria-hidden="true" />
          Classement des 24 mesures, en direct
        </h2>
        <p className="dash-sous mt-1">
          Points, {NOMBRE_MESURES_A_CLASSER} pour une mesure classée première, 1 pour la cinquième.
          Rang moyen parmi les personnes qui l'ont retenue.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="tableau min-w-[640px]">
            <thead>
              <tr>
                <th scope="col">Rang</th>
                <th scope="col">Mesure</th>
                <th scope="col">Points</th>
                <th scope="col">Retenue</th>
                <th scope="col">Rang moyen</th>
                <th scope="col">En tête</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((c, k) => (
                <tr key={c.mesure.id}>
                  <td className="font-display text-lg font-bold text-primaire">{k + 1}</td>
                  <td>
                    <span className="axe">{c.mesure.axe}</span>
                    <span className="block">{c.mesure.texte}</span>
                    <div className="dash-piste mt-1 h-1.5">
                      <div
                        className="dash-remplissage"
                        style={{ width: `${(c.points / maxPoints) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="tabular-nums">{c.points}</td>
                  <td className="tabular-nums">{c.selections}</td>
                  <td className="tabular-nums">
                    {c.rangMoyen === null
                      ? ""
                      : c.rangMoyen.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
                  </td>
                  <td className="tabular-nums">{c.enTete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Repartition i={2} titre="Âge" valeurs={r.map((x) => x.age)} options={Q.age.options} />
        <Repartition
          i={3}
          titre="Genre"
          valeurs={r.map((x) => x.genre)}
          options={Q.genre.options}
        />
        <Repartition
          i={4}
          titre="Région"
          valeurs={r.map((x) => x.region)}
          options={Q.region.options}
        />
        <Repartition
          i={5}
          titre="Lieu de vie"
          valeurs={r.map((x) => x.lieu_vie)}
          options={Q.lieuVie.options}
        />
        <Repartition
          i={6}
          titre="Lien avec l'enfance"
          valeurs={r.flatMap((x) => x.liens_enfance)}
          options={Q.liensEnfance.options}
        />
        <Repartition
          i={7}
          titre="Provenance"
          valeurs={r.map((x) => x.provenance ?? "sans-reponse")}
          options={[...Q.provenance.options, { valeur: "sans-reponse", libelle: "Pas de réponse" }]}
        />
      </div>

      <section className="dash-carte" aria-labelledby="mesures-manquantes">
        <h2 id="mesures-manquantes" className="dash-libelle">
          Une mesure manque, {s.mesuresManquantes.length} réponses libres
        </h2>
        {s.mesuresManquantes.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {s.mesuresManquantes
              .slice()
              .reverse()
              .map((t, k) => (
                <li
                  key={k}
                  className="whitespace-pre-line rounded-lg bg-fond-alterne p-3 text-[15px]"
                >
                  {t}
                </li>
              ))}
          </ul>
        ) : (
          <p className="dash-sous mt-3">Pas encore de réponse libre.</p>
        )}
      </section>
    </div>
  );
}
