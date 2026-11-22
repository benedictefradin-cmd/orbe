/** Construction des exports, séparés : réponses à la consultation, inscriptions aux ateliers, emails pour la suite. */
import { ATELIERS, FUSEAU, jourParis } from "@/lib/config";
import { libelle, Q, SITUATIONS_ATELIER, type Option } from "@/lib/formulaires";
import { mesureParId } from "@/lib/mesures";
import { neutraliser, serializeCsv } from "@/lib/csv";
import type { ContactSuite, InscriptionAdmin, ReponseAdmin } from "@/lib/server/services.server";

export type Tableau = { nom: string; entetes: string[]; lignes: string[][] };

const liste = (o: readonly Option[], v: readonly string[]) =>
  v.map((x) => libelle(o, x)).join(", ");
const dateHeure = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        timeZone: FUSEAU,
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";
export const STATUTS: Record<string, string> = {
  inscrit: "Inscrit",
  liste_attente: "Liste d'attente",
  annule: "Annulé",
};

export function tableauReponses(reponses: readonly ReponseAdmin[], n: number): Tableau {
  const entetes = [
    "Date",
    Q.age.libelle,
    Q.genre.libelle,
    Q.region.libelle,
    Q.lieuVie.libelle,
    Q.situation.libelle,
    Q.parent.libelle,
    Q.liensEnfance.libelle,
    Q.lienSujet.libelle,
    ...Array.from({ length: n }, (_, i) => `Mesure classée ${i + 1}`),
    Q.mesureManquante.libelle,
    Q.presenceDebat.libelle,
    Q.poidsVote.libelle,
    Q.provenance.libelle,
    "Version du questionnaire",
    "Ordre d'affichage des mesures",
  ];
  const lignes = reponses.map((r) => [
    r.jour,
    libelle(Q.age.options, r.age),
    libelle(Q.genre.options, r.genre),
    libelle(Q.region.options, r.region),
    libelle(Q.lieuVie.options, r.lieu_vie),
    libelle(Q.situation.options, r.situation),
    libelle(Q.parent.options, r.parent),
    liste(Q.liensEnfance.options, r.liens_enfance),
    liste(Q.lienSujet.options, r.lien_sujet),
    ...Array.from({ length: n }, (_, i) => {
      const m = mesureParId(r.classement[i] ?? "");
      return m ? `${m.id.toUpperCase()} · ${m.texte}` : "";
    }),
    r.mesure_manquante ?? "",
    libelle(Q.presenceDebat.options, r.presence_debat),
    libelle(Q.poidsVote.options, r.poids_vote),
    libelle(Q.provenance.options, r.provenance),
    r.version_questionnaire,
    (r.ordre_affichage ?? []).map((id) => id.toUpperCase()).join(" "),
  ]);
  return { nom: "Réponses", entetes, lignes };
}

export function tableauInscriptions(
  inscriptions: readonly InscriptionAdmin[],
  origine: string,
): Tableau {
  const parAtelier = ATELIERS.flatMap((a) => [
    `Atelier ${a.numero}, statut`,
    `Atelier ${a.numero}, sorti de la liste d'attente le`,
    `Atelier ${a.numero}, lien de visio envoyé le`,
    `Atelier ${a.numero}, présent`,
  ]);
  const entetes = [
    "Inscrit le",
    "Prénom",
    "Nom",
    "Email",
    "Département",
    "Situation",
    "Situation précisée",
    "Structure",
    "Pourquoi participer",
    "Besoin d'accessibilité",
    ...parAtelier,
    "18 ans ou plus confirmé le",
    "Accord organisation le",
    "Actualités Institut Rousseau le",
    "Actualités Face à l'inceste le",
    "Commentaire interne",
    "Lien d'annulation",
  ];
  const lignes = inscriptions.map((i) => [
    dateHeure(i.cree_le),
    i.prenom,
    i.nom,
    i.email,
    i.departement ?? "",
    liste(SITUATIONS_ATELIER, i.situations),
    i.situation_autre ?? "",
    i.structure ?? "",
    i.motivation ?? "",
    i.accessibilite ?? "",
    ...ATELIERS.flatMap((a) => {
      const d = i.dates.find((x) => x.atelier_id === a.id);
      return d
        ? [
            STATUTS[d.statut] ?? d.statut,
            dateHeure(d.promu_le),
            dateHeure(d.lien_visio_envoye_le),
            d.present_le ? "Oui" : "",
          ]
        : ["Non choisi", "", "", ""];
    }),
    dateHeure(i.majeur_confirme_le),
    dateHeure(i.consentement_organisation_le),
    dateHeure(i.actualites_ir_le),
    dateHeure(i.actualites_fai_le),
    i.commentaire ?? "",
    `${origine}/annuler/${i.jeton_annulation}`,
  ]);
  return { nom: "Inscriptions", entetes, lignes };
}

/** Emails laissés pour connaître la suite, sans aucun lien avec les réponses. */
export function tableauContactsSuite(contacts: readonly ContactSuite[]): Tableau {
  return {
    nom: "Suite",
    entetes: ["Email", "Laissé le"],
    lignes: contacts.map((c) => [c.email, c.jour]),
  };
}

export function nomFichier(
  base: "reponses-consultation" | "inscriptions-ateliers" | "contacts-suite",
  extension: "xlsx" | "csv",
  maintenant = new Date(),
): string {
  return `${base}-${jourParis(maintenant)}.${extension}`;
}

export function versCsv(t: Tableau): string {
  return "\ufeff" + serializeCsv([t.entetes, ...t.lignes]);
}

/** Classeur Excel, ligne d'en tête figée, cellules en texte et formules neutralisées. */
export async function versXlsx(t: Tableau): Promise<ArrayBuffer> {
  const { default: ExcelJS } = await import("exceljs");
  const classeur = new ExcelJS.Workbook();
  const feuille = classeur.addWorksheet(t.nom, { views: [{ state: "frozen", ySplit: 1 }] });
  feuille.addRow(t.entetes.map(neutraliser));
  for (const l of t.lignes) feuille.addRow(l.map(neutraliser));
  feuille.getRow(1).font = { bold: true };
  feuille.columns.forEach((c, i) => {
    c.width = Math.min(60, Math.max(12, (t.entetes[i]?.length ?? 10) + 2));
  });
  return classeur.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}

export function telecharger(contenu: BlobPart, type: string, nom: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenu], { type }));
  a.download = nom;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
