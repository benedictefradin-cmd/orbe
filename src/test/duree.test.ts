/**
 * Chronométrage d'un parcours complet de consultation, sur un modèle de lecture et de saisie :
 * tout le texte affiché est lu à 200 mots par minute, chaque clic compte 2 secondes,
 * la relecture du récapitulatif 45 secondes. Le parcours modèle répond à toutes
 * les questions du profil, choisit et ordonne 5 mesures, remplit les questions facultatives
 * sauf la mesure manquante, relit le récapitulatif et valide.
 * Le test Playwright (e2e/parcours.spec.ts) mesure aussi la durée machine, qui reste très inférieure.
 */
import { describe, expect, it } from "vitest";
import { CONSULTATION, DUREE_CONSULTATION_MINUTES } from "@/lib/contenus";
import { MESURES } from "@/lib/mesures";
import { Q } from "@/lib/formulaires";

const mots = (t: string) => t.split(/\s+/).filter(Boolean).length;
const texteQuestion = (q: {
  libelle: string;
  options?: readonly { libelle: string }[];
  aide?: string;
}) => [q.libelle, q.aide ?? "", ...(q.options ?? []).map((o) => o.libelle)].join(" ");

export function dureeParcoursSecondes() {
  const lecture = [
    ...CONSULTATION.recap,
    CONSULTATION.accroche,
    CONSULTATION.anonymat,
    CONSULTATION.profilIntro,
    texteQuestion(Q.age),
    texteQuestion(Q.genre),
    Q.region.libelle,
    texteQuestion(Q.lieuVie),
    texteQuestion(Q.situation),
    texteQuestion(Q.parent),
    texteQuestion(Q.liensEnfance),
    texteQuestion(Q.lienSujet),
    CONSULTATION.priorites.intro,
    CONSULTATION.priorites.aide,
    CONSULTATION.priorites.ordre,
    ...MESURES.map((m) => `${m.axe} ${m.texte}`),
    CONSULTATION.plusLoinIntro,
    texteQuestion(Q.mesureManquante),
    texteQuestion(Q.presenceDebat),
    texteQuestion(Q.poidsVote),
    texteQuestion(Q.provenance),
  ].join(" ");
  const relectureSecondes = 45; // récapitulatif
  const clics =
    8 /* profil */ +
    2 /* région, liste */ +
    5 +
    3 /* choix et réordonnancement */ +
    3 /* facultatives */ +
    4 /* continuer */ +
    1;
  return (mots(lecture) / 200) * 60 + relectureSecondes + clics * 2;
}

describe("durée affichée", () => {
  it("correspond au parcours chronométré, arrondi à la minute supérieure", () => {
    const secondes = dureeParcoursSecondes();
    const minutes = Math.ceil(secondes / 60);
    console.info(
      `Parcours chronométré : ${Math.round(secondes)} s, soit ${minutes} minutes affichées`,
    );
    expect(DUREE_CONSULTATION_MINUTES).toBe(minutes);
  });
});
