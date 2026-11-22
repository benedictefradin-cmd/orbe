import { DELAI_MINIMUM_ENVOI_MS, ENVOIS_MAX_PAR_HEURE } from "@/lib/config";
import { rpc } from "@/lib/server/db.server";
import { egaliteSure, empreinte, signer } from "@/lib/server/signature.server";

const DUREE_MAX_JETON_MS = 24 * 3600_000;

/** Jeton signé délivré à l'ouverture d'un formulaire, il porte l'heure d'ouverture. */
export async function creerJeton(formulaire: string, maintenantMs = Date.now()): Promise<string> {
  const t = String(maintenantMs);
  return `${t}.${await signer(`formulaire:${formulaire}`, t)}`;
}

export type RefusRobot = "piege" | "trop_rapide" | "jeton" | "quota";

/** Vérifie le champ piège et le délai minimal. Ne touche pas à la base. */
export async function verifierEnvoi(
  formulaire: string,
  jeton: string,
  siteWeb: string,
  maintenantMs = Date.now(),
  delaiMinimumMs = DELAI_MINIMUM_ENVOI_MS,
): Promise<RefusRobot | null> {
  if (siteWeb.trim() !== "") return "piege";
  const [t = "", sig = ""] = jeton.split(".");
  if (!/^\d{13}$/.test(t) || !egaliteSure(sig, await signer(`formulaire:${formulaire}`, t)))
    return "jeton";
  const age = maintenantMs - Number(t);
  if (age < delaiMinimumMs) return "trop_rapide";
  if (age > DUREE_MAX_JETON_MS) return "jeton";
  return null;
}

/** Adresse IP du client, uniquement pour calculer une empreinte salée. */
export function adresseClient(headers: Headers): string {
  const transmise = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  // En-têtes posés par l'hébergeur en priorité (Cloudflare, Vercel, Netlify), puis X-Forwarded-For.
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-nf-client-connection-ip") ??
    headers.get("x-real-ip") ??
    transmise ??
    "inconnue"
  );
}

/** Quota de 10 envois par heure et par adresse, sur une empreinte conservée 24 h. */
export async function verifierQuota(headers: Headers): Promise<boolean> {
  return rpc<boolean>("verifier_limite", {
    _empreinte: await empreinte(adresseClient(headers)),
    _max: ENVOIS_MAX_PAR_HEURE,
  });
}

export const MESSAGES_REFUS: Record<RefusRobot, string> = {
  piege: "Votre envoi n'a pas pu être pris en compte. Rechargez la page et réessayez.",
  trop_rapide:
    "Vous êtes allé un peu vite. Relisez vos réponses puis validez à nouveau dans quelques secondes.",
  jeton: "Le formulaire a expiré. Rechargez la page et réessayez.",
  quota: "Trop d'envois depuis cette connexion. Réessayez dans une heure.",
};

/** Connexion admin : 10 tentatives par heure et par adresse, compteur séparé des formulaires. */
export async function verifierQuotaConnexion(headers: Headers): Promise<boolean> {
  return rpc<boolean>("verifier_limite", {
    _empreinte: await empreinte(`admin:${adresseClient(headers)}`),
    _max: ENVOIS_MAX_PAR_HEURE,
  });
}
