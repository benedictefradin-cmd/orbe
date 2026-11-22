/** Logique serveur des deux parcours, indépendante de TanStack pour être testée directement. */
import {
  ATELIERS,
  CAPACITE_PAR_ATELIER,
  DELAI_MINIMUM_ENVOI_SUITE_MS,
  inscriptionsOuvertes,
  isClosed,
  jourParis,
  RESULTATS_PUBLICS,
  SUPPRESSION_DES_DONNEES_ATELIERS,
  VERSION_QUESTIONNAIRE,
} from "@/lib/config";
import {
  envoiConsultationSchema,
  envoiInscriptionSchema,
  envoiSuiteSchema,
  erreursParChamp,
} from "@/lib/formulaires";
import { MESSAGES_REFUS, verifierEnvoi, verifierQuota } from "@/lib/server/anti-robot.server";
import { rpc } from "@/lib/server/db.server";
import { aDejaRepondu } from "@/lib/server/participation.server";
import { compteurPublic, rangPublic, resultatsPublics } from "@/lib/statistiques";

export type Place = {
  atelier_id: string;
  capacite: number | null;
  inscrits: number;
  attente: number;
  restantes: number | null;
};
export type EtatSite = {
  maintenant: string;
  consultationClose: boolean;
  inscriptionsOuvertes: boolean;
  places: Place[];
  /** Nombre public de réponses (arrondi), null sous le seuil, compteur inactif ou erreur. */
  compteur: number | null;
};
export type Echec = { ok: false; message: string; erreurs?: Record<string, string> };

let synchronise: Promise<unknown> | undefined;
export function synchroniserAteliers(forcer = false) {
  if (forcer || !synchronise) {
    synchronise = rpc("synchroniser_ateliers", {
      _ateliers: ATELIERS.map((a) => ({
        id: a.id,
        titre: a.titre,
        debut: a.debut,
        fin: a.fin,
        capacite: CAPACITE_PAR_ATELIER === "illimité" ? null : CAPACITE_PAR_ATELIER,
      })),
    });
    synchronise.catch(() => {
      synchronise = undefined;
    });
  }
  return synchronise;
}

export async function lirePlaces(): Promise<Place[]> {
  await synchroniserAteliers();
  const brut = await rpc<Omit<Place, "restantes">[]>("etat_places");
  return brut.map((p) => ({
    ...p,
    inscrits: Number(p.inscrits),
    attente: Number(p.attente),
    restantes: p.capacite === null ? null : Math.max(0, p.capacite - Number(p.inscrits)),
  }));
}

/**
 * Appelée chaque jour par la tâche Vercel. Écrit réellement en base (mise à jour des ateliers, purge des
 * empreintes expirées) car Supabase met en pause un projet gratuit dont la base reste peu sollicitée 7 jours.
 */
export async function entretenirBase(): Promise<number> {
  await synchroniserAteliers(true);
  await rpc("purger_donnees_ateliers", { _a_partir_du: SUPPRESSION_DES_DONNEES_ATELIERS });
  return (await lirePlaces()).length;
}

/** Jamais de chiffre de repli : en cas d'erreur, le compteur ne s'affiche pas. */
export async function lireCompteur(): Promise<number | null> {
  try {
    return compteurPublic(Number(await rpc<number>("nombre_reponses")));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function etatSite(now: Date, avecPlaces = true): Promise<EtatSite> {
  const [places, compteur] = await Promise.all([
    avecPlaces ? lirePlaces() : Promise.resolve([]),
    avecPlaces ? lireCompteur() : Promise.resolve(null),
  ]);
  return {
    maintenant: now.toISOString(),
    consultationClose: isClosed(now),
    inscriptionsOuvertes: inscriptionsOuvertes(now),
    places,
    compteur,
  };
}

/** Résultats publics : agrégats seulement, et uniquement quand RESULTATS_PUBLICS est vrai. */
export async function lireResultatsPublics() {
  if (!RESULTATS_PUBLICS) return null;
  return resultatsPublics(await rpc<ReponseAdmin[]>("admin_reponses"));
}

const ERREUR_TECHNIQUE =
  "L'enregistrement n'a pas fonctionné. Vos réponses sont toujours là, réessayez dans un instant.";

export const MESSAGE_DEJA_REPONDU =
  "Une réponse a déjà été envoyée depuis ce navigateur. La consultation accepte une seule réponse par personne.";

export async function enregistrerConsultation(
  input: unknown,
  headers: Headers,
  now: Date,
): Promise<{ ok: true; rang: number | null } | (Echec & { dejaRepondu?: true })> {
  if (isClosed(now))
    return { ok: false, message: "La consultation est close, merci pour votre intérêt." };
  if (aDejaRepondu(headers)) return { ok: false, message: MESSAGE_DEJA_REPONDU, dejaRepondu: true };
  const v = envoiConsultationSchema.safeParse(input);
  if (!v.success)
    return {
      ok: false,
      message: "Certaines réponses sont à vérifier.",
      erreurs: erreursParChamp(v.error),
    };
  const refus = await verifierEnvoi("consultation", v.data.jeton, v.data.siteWeb);
  if (refus) return { ok: false, message: MESSAGES_REFUS[refus] };
  try {
    if (!(await verifierQuota(headers))) return { ok: false, message: MESSAGES_REFUS.quota };
    const d = v.data;
    const r = await rpc<{ statut: string; rang?: number }>("enregistrer_reponse", {
      r: {
        jour: jourParis(now),
        age: d.age,
        genre: d.genre,
        region: d.region,
        lieu_vie: d.lieuVie,
        situation: d.situation,
        parent: d.parent,
        liens_enfance: d.liensEnfance,
        lien_sujet: d.lienSujet,
        classement: d.classement,
        mesure_manquante: d.mesureManquante,
        presence_debat: d.presenceDebat,
        poids_vote: d.poidsVote,
        provenance: d.provenance,
        version_questionnaire: VERSION_QUESTIONNAIRE,
        ordre_affichage: d.ordreAffichage,
        mesures_rejetees: d.mesuresRejetees,
      },
    });
    if (r.statut !== "ok") return { ok: false, message: ERREUR_TECHNIQUE };
    // Le rang n'est renvoyé qu'à la personne qui répond, et seulement si le compteur public s'affiche.
    return { ok: true, rang: rangPublic(r.rang) };
  } catch (e) {
    console.error(e);
    return { ok: false, message: ERREUR_TECHNIQUE };
  }
}

/** Email laissé pour connaître la suite. Enregistré à part, sans lien avec une réponse. */
export async function enregistrerContactSuite(
  input: unknown,
  headers: Headers,
  now: Date,
): Promise<{ ok: true } | Echec> {
  const v = envoiSuiteSchema.safeParse(input);
  if (!v.success)
    return {
      ok: false,
      message: "Votre email est à vérifier.",
      erreurs: erreursParChamp(v.error),
    };
  const refus = await verifierEnvoi(
    "suite",
    v.data.jeton,
    v.data.siteWeb,
    Date.now(),
    DELAI_MINIMUM_ENVOI_SUITE_MS,
  );
  if (refus) return { ok: false, message: MESSAGES_REFUS[refus] };
  try {
    if (!(await verifierQuota(headers))) return { ok: false, message: MESSAGES_REFUS.quota };
    await rpc("inscrire_contact_suite", { _email: v.data.email, _jour: jourParis(now) });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "L'enregistrement n'a pas fonctionné. Réessayez dans un instant.",
    };
  }
}

export type ResultatInscription = {
  ok: true;
  jeton: string;
  dates: { atelier_id: string; statut: "inscrit" | "liste_attente" }[];
};

export async function enregistrerInscription(
  input: unknown,
  headers: Headers,
  now: Date,
): Promise<ResultatInscription | Echec> {
  if (!inscriptionsOuvertes(now))
    return {
      ok: false,
      message: "Les inscriptions aux ateliers sont closes. Merci pour votre intérêt.",
    };
  const v = envoiInscriptionSchema.safeParse(input);
  if (!v.success)
    return {
      ok: false,
      message: "Certains champs sont à vérifier.",
      erreurs: erreursParChamp(v.error),
    };
  const refus = await verifierEnvoi("inscription", v.data.jeton, v.data.siteWeb);
  if (refus) return { ok: false, message: MESSAGES_REFUS[refus] };
  try {
    if (!(await verifierQuota(headers))) return { ok: false, message: MESSAGES_REFUS.quota };
    await synchroniserAteliers();
    const d = v.data;
    const r = await rpc<{ statut: string; jeton?: string; dates?: ResultatInscription["dates"] }>(
      "inscrire_atelier",
      {
        r: {
          ateliers: d.ateliers,
          prenom: d.prenom,
          nom: d.nom,
          email: d.email,
          departement: d.departement,
          situations: d.situations,
          situation_autre: d.situations.includes("autre") ? d.situationAutre : "",
          structure: d.structure,
          motivation: d.motivation,
          accessibilite: d.accessibilite,
          actualites_ir: d.actualitesIr,
          actualites_fai: d.actualitesFai,
        },
      },
    );
    if (r.statut === "deja_inscrit")
      return {
        ok: false,
        message: "Cette adresse email est déjà inscrite. Pour changer de date, écrivez nous.",
        erreurs: { email: "Cette adresse email est déjà inscrite." },
      };
    if (r.statut !== "ok" || !r.jeton || !r.dates) return { ok: false, message: ERREUR_TECHNIQUE };
    return { ok: true, jeton: r.jeton, dates: r.dates };
  } catch (e) {
    console.error(e);
    return { ok: false, message: ERREUR_TECHNIQUE };
  }
}

export type InscriptionPublique = {
  prenom: string;
  dates: { atelier_id: string; statut: string }[];
} | null;

export async function lireInscription(jeton: string): Promise<InscriptionPublique> {
  return rpc<InscriptionPublique>("inscription_par_jeton", { _jeton: jeton });
}

export async function annulerInscription(
  jeton: string,
): Promise<"ok" | "introuvable" | "deja_annule"> {
  const r = await rpc<{ statut: "ok" | "introuvable" | "deja_annule" }>("annuler_par_jeton", {
    _jeton: jeton,
  });
  return r.statut;
}

/* ───────────── Administration ───────────── */

export type DateInscription = {
  atelier_id: string;
  statut: "inscrit" | "liste_attente" | "annule";
  cree_le: string;
  promu_le: string | null;
  prevenu_le: string | null;
  annule_le: string | null;
  annule_par: "personne" | "organisatrice" | null;
  lien_visio_envoye_le: string | null;
  present_le: string | null;
};
export type InscriptionAdmin = {
  id: string;
  cree_le: string;
  prenom: string;
  nom: string;
  email: string;
  departement: string | null;
  situations: string[];
  situation_autre: string | null;
  structure: string | null;
  motivation: string | null;
  accessibilite: string | null;
  majeur_confirme_le: string;
  consentement_organisation_le: string;
  actualites_ir_le: string | null;
  actualites_fai_le: string | null;
  jeton_annulation: string;
  commentaire: string | null;
  dates: DateInscription[];
};
export type ReponseAdmin = {
  jour: string;
  age: string;
  genre: string;
  region: string;
  lieu_vie: string;
  situation: string;
  parent: string;
  liens_enfance: string[];
  lien_sujet: string[];
  classement: string[];
  mesure_manquante: string | null;
  presence_debat: string | null;
  poids_vote: string | null;
  provenance: string | null;
  /** « v1 » pour les réponses antérieures au questionnaire actuel. */
  version_questionnaire: string;
  /** Ordre de présentation des 24 mesures (null en v1). */
  ordre_affichage: string[] | null;
  /** Mesures non soutenues, 3 au plus (null en v1, question absente). */
  mesures_rejetees: string[] | null;
};
export type ContactSuite = { email: string; jour: string };
export type DonneesAdmin = {
  reponses: ReponseAdmin[];
  contactsSuite: ContactSuite[];
  inscriptions: InscriptionAdmin[];
  places: Place[];
  misAJour: string;
  maintenant: string;
};

export async function donneesAdmin(now: Date): Promise<DonneesAdmin> {
  await rpc("purger_donnees_ateliers", { _a_partir_du: SUPPRESSION_DES_DONNEES_ATELIERS });
  const [reponses, inscriptions, places, contactsSuite] = await Promise.all([
    rpc<ReponseAdmin[]>("admin_reponses"),
    rpc<InscriptionAdmin[]>("admin_inscriptions"),
    lirePlaces(),
    rpc<ContactSuite[]>("admin_contacts_suite"),
  ]);
  return {
    reponses,
    contactsSuite,
    inscriptions,
    places,
    misAJour: new Date().toISOString(),
    maintenant: now.toISOString(),
  };
}
