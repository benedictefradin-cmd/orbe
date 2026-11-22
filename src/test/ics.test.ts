import { describe, expect, it } from "vitest";
import { ATELIERS, CONTACT_URL } from "@/lib/config";
import { genererIcs } from "@/lib/ics";

const deplier = (ics: string) => ics.replace(/\r\n /g, "");

describe("fichier agenda", () => {
  const lien = "https://exemple.fr/annuler/0f8fad5b-d9cb-469f-a165-70867728950e";
  const ics = genererIcs({
    atelier: ATELIERS[0],
    lienAnnulation: lien,
    contact: CONTACT_URL,
    listeAttente: false,
    maintenant: new Date("2026-11-21T10:00:00Z"),
  });
  it("contient l'horaire en UTC et le titre", () => {
    expect(ics).toContain("DTSTART:20261214T153000Z");
    expect(ics).toContain("DTEND:20261214T170000Z");
    expect(deplier(ics)).toContain("SUMMARY:Atelier 1 : Repérer et protéger");
  });
  it("contient le lien d'annulation, la phrase visio et le contact", () => {
    const d = deplier(ics);
    expect(d).toContain(lien);
    expect(d).toContain(
      "Le lien de la visio vous sera envoyé par l'Institut Rousseau avant l'atelier.",
    );
    expect(d).toContain(CONTACT_URL);
  });
  it("respecte le format (CRLF, lignes de 75 octets au plus)", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    for (const l of ics.split("\r\n"))
      expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
  });
});
