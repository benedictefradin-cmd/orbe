import { describe, expect, it } from "vitest";
import {
  ATELIERS,
  DERNIER_JOUR_INSCRIPTION,
  FERMETURE_CONSULTATION,
  FERMETURE_INSCRIPTIONS,
  ajouterJours,
  formaterCreneau,
  formaterJour,
  inscriptionsOuvertes,
  isClosed,
  jourParis,
  minuitParis,
} from "@/lib/config";

describe("calendrier, heure de Paris", () => {
  it("calcule le dernier jour d'inscription trois jours avant le premier atelier", () => {
    expect(jourParis(ATELIERS[0].debut)).toBe("2026-12-14");
    expect(DERNIER_JOUR_INSCRIPTION).toBe("2026-12-11");
    expect(formaterJour(DERNIER_JOUR_INSCRIPTION)).toBe("vendredi 11 décembre");
  });

  it("ferme les inscriptions le lendemain à 0 h 00, heure de Paris", () => {
    expect(FERMETURE_INSCRIPTIONS.toISOString()).toBe("2026-12-11T23:00:00.000Z");
    expect(inscriptionsOuvertes(new Date("2026-12-11T23:59:59+01:00"))).toBe(true);
    expect(inscriptionsOuvertes(new Date("2026-12-12T00:00:00+01:00"))).toBe(false);
    expect(inscriptionsOuvertes(new Date("2026-12-20T10:00:00+01:00"))).toBe(false);
  });

  it("ferme la consultation le même jour que les inscriptions", () => {
    expect(FERMETURE_CONSULTATION.toISOString()).toBe("2026-12-11T23:00:00.000Z");
    expect(isClosed(new Date("2026-12-11T23:59:00+01:00"))).toBe(false);
    expect(isClosed(new Date("2026-12-12T00:00:00+01:00"))).toBe(true);
  });

  it("gère le passage à l'heure d'été", () => {
    expect(minuitParis("2027-03-28").toISOString()).toBe("2027-03-27T23:00:00.000Z");
    expect(minuitParis("2027-03-29").toISOString()).toBe("2027-03-28T22:00:00.000Z");
    expect(ajouterJours("2027-02-27", 2)).toBe("2027-03-01");
  });

  it("formate les créneaux en français", () => {
    expect(formaterCreneau(ATELIERS[0].debut, ATELIERS[0].fin)).toBe(
      "lundi 14 décembre de 16h30 à 18h",
    );
    expect(formaterCreneau(ATELIERS[1].debut, ATELIERS[1].fin)).toBe(
      "vendredi 18 décembre de 12h30 à 14h",
    );
  });
});
