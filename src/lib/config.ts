/**
 * Toutes les valeurs à modifier pour faire vivre le site sont ici.
 * Les dates s'écrivent avec le décalage de Paris (+01:00 en hiver, +02:00 en été).
 * Module sûr côté navigateur, réutilisé par le serveur pour appliquer les mêmes règles.
 */

export const FUSEAU = "Europe/Paris";

export type AtelierId = "atelier-1" | "atelier-2";
export type Atelier = {
  id: AtelierId;
  numero: 1 | 2;
  titre: string;
  debut: string;
  fin: string;
};

export const ATELIERS: readonly [Atelier, Atelier] = [
  {
    id: "atelier-1",
    numero: 1,
    titre: "Repérer et protéger",
    debut: "2026-12-14T16:30:00+01:00",
    fin: "2026-12-14T18:00:00+01:00",
  },
  {
    id: "atelier-2",
    numero: 2,
    titre: "Juger, soigner, financer",
    debut: "2026-12-18T12:30:00+01:00",
    fin: "2026-12-18T14:00:00+01:00",
  },
];

/** Nombre de places par atelier, ou "illimité" (pas de liste d'attente dans ce cas). */
export const CAPACITE_PAR_ATELIER: number | "illimité" = 30;

/** Dernier jour inclus de la consultation, le même que pour les inscriptions. Elle ferme le lendemain à 0 h 00, heure de Paris. */
export const CLOTURE_CONSULTATION = "2026-12-11";

/** Reprise de la V1 : moment où la synthèse est présentée. */
export const RESTITUTION = "en février 2027";

/** Débat de politique globale organisé par l'Institut Rousseau. */
export const DEBAT = "février 2027";

/** Restitution des ateliers, distincte du débat. */
export const RESTITUTION_ATELIERS = {
  debut: "2027-01-28T19:00:00+01:00",
  fin: "2027-01-28T20:00:00+01:00",
};

/** Pas d'adresse email publique : les participants écrivent via le formulaire de l'Institut, sujet présélectionné. */
export const CONTACT_URL = "https://institut-rousseau.fr/contact?sujet=atelier-enfance";

export const RESPONSABLE_DES_DONNEES = "l'Institut Rousseau";

/** Les inscriptions aux ateliers et les emails laissés pour connaître la suite sont supprimés ce jour là. */
export const SUPPRESSION_DES_DONNEES_ATELIERS = "2027-03-31";

/** Nombre de mesures à classer parmi les 24. */
export const NOMBRE_MESURES_A_CLASSER = 5;

/**
 * Version du questionnaire enregistrée avec chaque réponse. Les réponses antérieures au 23 novembre 2026
 * sont en v1 (profil en premier, sans ordre d'affichage). Toute modification des questions crée une nouvelle version.
 */
export const VERSION_QUESTIONNAIRE = "v2";

/* ───────────── Redevabilité ───────────── */

/** Compteur public des réponses : affiché seulement à partir du seuil, arrondi à la dizaine inférieure. */
export const COMPTEUR_ACTIF = true;
export const SEUIL_COMPTEUR = 100;

/** Aucun chiffre portant sur moins de réponses que ce seuil n'est affiché (résultats, tableau de bord). */
export const SEUIL_DIFFUSION = 10;

/** Date de publication des résultats (AAAA-MM-JJ). Vide tant qu'elle n'est pas décidée : rien ne s'affiche. */
export const DATE_RESULTATS = "";

/** La page /resultats renvoie une erreur 404 tant que ce réglage vaut false. */
export const RESULTATS_PUBLICS = false;

/** Suppression des réponses anonymes (AAAA-MM-JJ). Vide tant qu'elle n'est pas décidée (docs/refonte/a-valider.md). */
export const SUPPRESSION_DES_REPONSES = "";

/** Nombre maximal de mesures que l'on peut signaler comme non soutenues (question facultative). */
export const MAX_MESURES_REJETEES = 3;

/** Anti robots : délai minimal entre l'ouverture d'un formulaire et son envoi, et quota horaire par adresse. */
export const DELAI_MINIMUM_ENVOI_MS = 20_000;
/** Formulaire court de l'écran de remerciement (un seul champ email). */
export const DELAI_MINIMUM_ENVOI_SUITE_MS = 3_000;
export const ENVOIS_MAX_PAR_HEURE = 10;

/* ───────────── Calcul des dates, en heure de Paris ───────────── */

const JOUR_MS = 86_400_000;

/** Date AAAA-MM-JJ à Paris pour un instant donné. */
export function jourParis(instant: Date | string): string {
  return new Date(instant).toLocaleDateString("sv-SE", { timeZone: FUSEAU });
}

/** Décalage de Paris (en ms) à un instant donné. */
function decalageParis(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSEAU,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const commeUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return commeUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instant correspondant à 0 h 00 à Paris le jour AAAA-MM-JJ. */
export function minuitParis(jour: string): Date {
  const [a, m, j] = jour.split("-").map(Number) as [number, number, number];
  const utc = Date.UTC(a, m - 1, j);
  const premier = utc - decalageParis(new Date(utc));
  return new Date(utc - decalageParis(new Date(premier)));
}

export function ajouterJours(jour: string, n: number): string {
  const [a, m, j] = jour.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(a, m - 1, j) + n * JOUR_MS).toISOString().slice(0, 10);
}

/** Dernier jour d'inscription inclus, trois jours avant le premier atelier. */
export const DERNIER_JOUR_INSCRIPTION = ajouterJours(jourParis(ATELIERS[0].debut), -3);
/** Fermeture effective des inscriptions, le lendemain à 0 h 00. */
export const FERMETURE_INSCRIPTIONS = minuitParis(ajouterJours(DERNIER_JOUR_INSCRIPTION, 1));
export const FERMETURE_CONSULTATION = minuitParis(ajouterJours(CLOTURE_CONSULTATION, 1));

export function inscriptionsOuvertes(maintenant: Date): boolean {
  return maintenant.getTime() < FERMETURE_INSCRIPTIONS.getTime();
}

/** Reprise de la V1 : vrai quand la consultation n'accepte plus de réponses. */
export function isClosed(maintenant: Date = new Date()): boolean {
  return maintenant.getTime() >= FERMETURE_CONSULTATION.getTime();
}

/* ───────────── Mise en forme française ───────────── */

/** « lundi 14 décembre » */
export function formaterJour(instant: Date | string, avecAnnee = false): string {
  const d =
    typeof instant === "string" && /^\d{4}-\d{2}-\d{2}$/.test(instant)
      ? minuitParis(instant)
      : new Date(instant);
  return d.toLocaleDateString("fr-FR", {
    timeZone: FUSEAU,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(avecAnnee ? { year: "numeric" } : {}),
  });
}

/** « 16h30 », « 18h » */
export function formaterHeure(instant: Date | string): string {
  const [h, m] = new Date(instant)
    .toLocaleTimeString("fr-FR", { timeZone: FUSEAU, hour: "2-digit", minute: "2-digit" })
    .split(":") as [string, string];
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

/** « 11 décembre », sans le jour de la semaine */
export function formaterJourCourt(jour: string): string {
  return minuitParis(jour).toLocaleDateString("fr-FR", {
    timeZone: FUSEAU,
    day: "numeric",
    month: "long",
  });
}

/** « lundi 14 décembre de 16h30 à 18h » */
export function formaterCreneau(debut: string, fin: string, avecAnnee = false): string {
  return `${formaterJour(debut, avecAnnee)} de ${formaterHeure(debut)} à ${formaterHeure(fin)}`;
}

export function dureeMinutes(debut: string, fin: string): number {
  return Math.round((new Date(fin).getTime() - new Date(debut).getTime()) / 60_000);
}

/** « 1h30 » */
export function formaterDuree(minutes: number): string {
  const h = Math.floor(minutes / 60),
    m = minutes % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m} minutes`;
}

export function atelierParId(id: string): Atelier | undefined {
  return ATELIERS.find((a) => a.id === id);
}
