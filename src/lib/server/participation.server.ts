/**
 * Une seule réponse par navigateur. Après un envoi réussi, le serveur pose un cookie technique
 * qui ne contient qu'un marqueur fixe : ni identifiant, ni heure, rien qui permette de retrouver la réponse.
 * Il expire à la clôture de la consultation. Il ne vaut que pour ce navigateur.
 */
import { FERMETURE_CONSULTATION } from "@/lib/config";

export const COOKIE_PARTICIPATION = "consultation_envoyee";
const VALEUR = "1";

export function aDejaRepondu(headers: Headers): boolean {
  return (headers.get("cookie") ?? "")
    .split(";")
    .some((c) => c.trim() === `${COOKIE_PARTICIPATION}=${VALEUR}`);
}

export function cookieParticipation(now: Date) {
  const jusquaClotureS = Math.ceil((FERMETURE_CONSULTATION.getTime() - now.getTime()) / 1000);
  return {
    nom: COOKIE_PARTICIPATION,
    valeur: VALEUR,
    options: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: Math.max(86_400, jusquaClotureS),
    },
  };
}
