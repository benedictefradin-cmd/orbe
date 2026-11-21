/** Fichier agenda d'un atelier. Le site n'envoie aucun email : tout ce qu'il faut garder est ici. */
import { formaterCreneau, type Atelier } from "@/lib/config";

const utc = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const echapper = (t: string) =>
  t
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");

/** Repli des lignes à 75 octets (RFC 5545). */
function plier(ligne: string): string {
  const octets = new TextEncoder();
  const morceaux: string[] = [];
  let courant = "";
  for (const c of ligne) {
    if (octets.encode(courant + c).length > (morceaux.length ? 74 : 75)) {
      morceaux.push(courant);
      courant = "";
    }
    courant += c;
  }
  morceaux.push(courant);
  return morceaux.join("\r\n ");
}

export function genererIcs({
  atelier,
  lienAnnulation,
  contact,
  listeAttente,
  maintenant = new Date(),
}: {
  atelier: Atelier;
  lienAnnulation: string;
  contact: string;
  listeAttente: boolean;
  maintenant?: Date;
}): string {
  const titre = `Atelier ${atelier.numero}, ${atelier.titre}`;
  const description = [
    `${titre}, consultation citoyenne et ateliers, présidentielle 2027.`,
    `Le ${formaterCreneau(atelier.debut, atelier.fin, true)}, heure de Paris, en visio.`,
    ...(listeAttente
      ? ["Vous êtes sur liste d'attente. Nous vous écrirons si une place se libère."]
      : []),
    "Le lien de la visio vous sera envoyé par l'Institut Rousseau avant l'atelier.",
    `Un empêchement ? Annulez ici pour libérer votre place ${lienAnnulation}`,
    `Une question ? Écrivez nous ${contact}`,
  ].join("\n");
  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Institut Rousseau//Ateliers enfance 2027//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${atelier.id}-${lienAnnulation.split("/").pop()}@consultation-enfance-2027`,
    `DTSTAMP:${utc(maintenant.toISOString())}`,
    `DTSTART:${utc(atelier.debut)}`,
    `DTEND:${utc(atelier.fin)}`,
    `SUMMARY:${echapper(listeAttente ? `${titre} (liste d'attente)` : titre)}`,
    `DESCRIPTION:${echapper(description)}`,
    "LOCATION:En visio",
    `URL:${lienAnnulation}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${echapper(titre)}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lignes.map(plier).join("\r\n") + "\r\n";
}
