/**
 * Heure de référence pour les règles de calendrier.
 * DATE_SIMULEE (ISO 8601) permet de tester les fermetures, uniquement hors production.
 */
export function maintenant(): Date {
  const simulee = process.env["DATE_SIMULEE"];
  if (simulee && process.env["NODE_ENV"] !== "production") {
    const d = new Date(simulee);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}
