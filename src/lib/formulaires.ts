import { z } from "zod";
import { MESURE_IDS } from "@/lib/mesures";
import { NOMBRE_MESURES_A_CLASSER } from "@/lib/config";

/** Messages zod en français : aucun message anglais par défaut ne doit s'afficher. */
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case "too_small":
      return {
        message:
          issue.type === "string"
            ? "Ce champ est obligatoire."
            : issue.type === "array"
              ? "Faites au moins un choix."
              : "Valeur trop petite.",
      };
    case "too_big":
      return {
        message:
          issue.type === "string"
            ? `Ce champ contient trop de caractères (${String(issue.maximum)} au maximum).`
            : "Valeur trop grande.",
      };
    case "invalid_string":
      return {
        message:
          issue.validation === "email" ? "Indiquez une adresse email valide." : "Format invalide.",
      };
    case "invalid_type":
      return {
        message:
          issue.received === "undefined" || issue.received === "null"
            ? "Ce champ est obligatoire."
            : "Valeur invalide.",
      };
    case "invalid_enum_value":
    case "invalid_literal":
      return { message: "Choisissez une réponse." };
    default:
      return { message: ctx.defaultError && "Vérifiez ce champ." };
  }
});

export type Option = { valeur: string; libelle: string };
const opts = (liste: [string, string][]): Option[] =>
  liste.map(([valeur, libelle]) => ({ valeur, libelle }));
const valeurs = (o: Option[]) => o.map((x) => x.valeur) as [string, ...string[]];

export const NE_PAS_REPONDRE: Option = { valeur: "nsp", libelle: "Je préfère ne pas répondre" };

/* ───────────── Consultation ───────────── */

export const Q = {
  age: {
    libelle: "Votre âge",
    options: opts([
      ["15-17", "15 à 17 ans"],
      ["18-24", "18 à 24 ans"],
      ["25-34", "25 à 34 ans"],
      ["35-49", "35 à 49 ans"],
      ["50-64", "50 à 64 ans"],
      ["65+", "65 ans et plus"],
    ]),
  },
  genre: {
    libelle: "Vous êtes",
    options: opts([
      ["femme", "Une femme"],
      ["homme", "Un homme"],
      ["autre", "Autre"],
    ]),
  },
  region: {
    libelle: "Votre région",
    options: opts([
      ["ara", "Auvergne Rhône Alpes"],
      ["bfc", "Bourgogne Franche Comté"],
      ["bretagne", "Bretagne"],
      ["cvl", "Centre Val de Loire"],
      ["corse", "Corse"],
      ["grand-est", "Grand Est"],
      ["hdf", "Hauts de France"],
      ["idf", "Île de France"],
      ["normandie", "Normandie"],
      ["nouvelle-aquitaine", "Nouvelle Aquitaine"],
      ["occitanie", "Occitanie"],
      ["pdl", "Pays de la Loire"],
      ["paca", "Provence Alpes Côte d'Azur"],
      ["outre-mer", "Outre mer"],
      ["etranger", "À l'étranger"],
    ]),
  },
  lieuVie: {
    libelle: "Vous vivez",
    options: opts([
      ["rural", "Dans une commune rurale"],
      ["petite-ville", "Dans une petite ville de moins de 20 000 habitants"],
      ["ville-moyenne", "Dans une ville moyenne"],
      ["grande-ville", "Dans une grande ville de plus de 100 000 habitants"],
      ["agglo-paris", "Dans l'agglomération parisienne"],
    ]),
  },
  situation: {
    libelle: "Votre situation",
    options: opts([
      ["emploi", "En emploi"],
      ["recherche", "En recherche d'emploi"],
      ["etudes", "En études"],
      ["retraite", "À la retraite"],
      ["autre", "Autre"],
    ]),
  },
  parent: {
    libelle: "Êtes vous parent ou responsable d'un enfant mineur ?",
    options: opts([
      ["oui", "Oui"],
      ["non", "Non"],
    ]),
  },
  liensEnfance: {
    libelle: "Avez vous un lien avec l'enfance dans votre métier ou votre engagement ?",
    aide: "Plusieurs choix possibles",
    options: opts([
      ["sante", "Santé"],
      ["sante-mentale", "Santé mentale"],
      ["education", "Éducation"],
      ["protection-enfance", "Protection de l'enfance ou travail social"],
      ["justice", "Justice ou droit"],
      ["police", "Police ou gendarmerie"],
      ["association", "Association"],
      ["elu", "Mandat d'élu"],
      ["aucun", "Aucun"],
    ]),
  },
  lienSujet: {
    libelle: "Votre lien avec le sujet",
    aide: "Facultatif (plusieurs choix possibles)",
    options: opts([
      ["connait-victime", "Je connais une personne victime de violences dans son enfance"],
      ["concerne", "Je suis personnellement concerné"],
      ["aucun", "Aucun lien connu"],
    ]),
  },
  presenceDebat: {
    libelle: "Ce sujet est il assez présent dans le débat public ?",
    options: opts([
      ["pas-du-tout", "Pas du tout"],
      ["peu", "Peu"],
      ["assez", "Assez"],
      ["tout-a-fait", "Tout à fait"],
    ]),
  },
  poidsVote: {
    libelle: "Les engagements des candidats sur ces mesures compteront ils dans votre choix ?",
    options: opts([
      ["beaucoup", "Beaucoup"],
      ["un-peu", "Un peu"],
      ["pas-du-tout", "Pas du tout"],
      ["ne-sait-pas", "Je ne sais pas"],
    ]),
  },
  provenance: {
    libelle: "Comment avez vous connu la consultation ?",
    options: opts([
      ["reseaux-ir", "Les réseaux de l'Institut Rousseau"],
      ["reseaux-fai", "Les réseaux de Face à l'inceste"],
      ["association", "Une association"],
      ["entourage", "Une personne de mon entourage"],
      ["presse", "La presse"],
      ["autre", "Autre"],
    ]),
  },
  mesureManquante: {
    libelle: "Une mesure manque selon vous ?",
    aide: "Ne mentionnez aucun nom ni détail qui permettrait d'identifier une personne.",
    max: 500,
  },
} as const;

/** Profil, chaque question accepte « Je préfère ne pas répondre ». */
const avecNsp = (o: readonly Option[]) =>
  z.enum([...valeurs([...o]), NE_PAS_REPONDRE.valeur] as [string, ...string[]], {
    errorMap: () => ({ message: "Choisissez une réponse ou « Je préfère ne pas répondre »." }),
  });
const multiAvecNsp = (o: readonly Option[]) =>
  z
    .array(z.enum([...valeurs([...o]), NE_PAS_REPONDRE.valeur] as [string, ...string[]]))
    .min(1, "Choisissez au moins une réponse ou « Je préfère ne pas répondre ».")
    .max(o.length + 1)
    .refine(
      (v) => !v.includes(NE_PAS_REPONDRE.valeur) || v.length === 1,
      "« Je préfère ne pas répondre » ne se combine pas avec une autre réponse.",
    );
const facultatif = (o: readonly Option[]) => z.enum(valeurs([...o])).nullable();

export const profilSchema = z.object({
  age: avecNsp(Q.age.options),
  genre: avecNsp(Q.genre.options),
  region: avecNsp(Q.region.options),
  lieuVie: avecNsp(Q.lieuVie.options),
  situation: avecNsp(Q.situation.options),
  parent: avecNsp(Q.parent.options),
  liensEnfance: multiAvecNsp(Q.liensEnfance.options),
  lienSujet: z.array(z.enum(valeurs([...Q.lienSujet.options]))).max(3),
});

export const classementSchema = z.object({
  classement: z
    .array(z.enum(MESURE_IDS))
    .length(NOMBRE_MESURES_A_CLASSER, `Choisissez et classez ${NOMBRE_MESURES_A_CLASSER} mesures.`)
    .refine((v) => new Set(v).size === v.length, "Chaque mesure ne peut être choisie qu'une fois."),
});

export const pourAllerPlusLoinSchema = z.object({
  mesureManquante: z
    .string()
    .trim()
    .max(Q.mesureManquante.max, `${Q.mesureManquante.max} caractères au maximum.`)
    .default(""),
  presenceDebat: facultatif(Q.presenceDebat.options),
  poidsVote: facultatif(Q.poidsVote.options),
  provenance: facultatif(Q.provenance.options),
});

/** Champs communs anti robots, présents dans chaque formulaire. */
export const antiRobotSchema = z.object({
  /** Champ piège invisible, doit rester vide. */
  siteWeb: z.string().max(200).default(""),
  /** Jeton signé délivré par le serveur à l'ouverture du formulaire. */
  jeton: z.string().max(200),
});

export const consultationSchema = profilSchema
  .merge(classementSchema)
  .merge(pourAllerPlusLoinSchema);
export const envoiConsultationSchema = consultationSchema.merge(antiRobotSchema);
export type ReponseConsultation = z.infer<typeof consultationSchema>;

/* ───────────── Inscription aux ateliers ───────────── */

export const SITUATIONS_ATELIER = opts([
  ["sante", "Vous travaillez dans la santé"],
  ["sante-mentale", "Vous travaillez dans la santé mentale"],
  ["education", "Vous travaillez dans l'éducation"],
  ["protection-enfance", "Vous travaillez dans la protection de l'enfance ou le travail social"],
  ["justice", "Vous travaillez dans la justice ou le droit"],
  ["police", "Vous travaillez dans la police ou la gendarmerie"],
  ["association", "Vous êtes membre d'une association"],
  ["politique", "Vous êtes élu ou collaborateur politique"],
  ["recherche", "Vous êtes chercheur"],
  ["parent", "Vous êtes parent"],
  ["etudes", "Vous êtes en études"],
  ["citoyen", "Vous êtes un citoyen intéressé"],
  ["autre", "Autre (à préciser)"],
]);

export const LIBELLES_INSCRIPTION = {
  ateliers: "Choisissez une ou deux dates",
  prenom: "Prénom",
  nom: "Nom",
  email: "Email",
  departement: "Département",
  situations: "Votre situation",
  situationAutre: "Précisez votre situation",
  structure: "Structure ou organisation",
  motivation: "Pourquoi souhaitez vous participer ?",
  accessibilite: "Avez vous un besoin d'accessibilité ?",
  majeur: "J'ai 18 ans ou plus",
  consentementOrganisation:
    "J'accepte que l'Institut Rousseau et Face à l'inceste utilisent mes coordonnées pour organiser l'atelier",
  actualitesIr: "Je souhaite recevoir les actualités de l'Institut Rousseau",
  actualitesFai: "Je souhaite recevoir les actualités de Face à l'inceste",
} as const;

export const inscriptionSchema = z
  .object({
    ateliers: z
      .array(z.enum(["atelier-1", "atelier-2"]))
      .min(1, "Choisissez au moins une date.")
      .max(2)
      .refine((v) => new Set(v).size === v.length, "Choisissez au moins une date."),
    prenom: z.string().trim().min(1, "Indiquez votre prénom.").max(100),
    nom: z.string().trim().min(1, "Indiquez votre nom.").max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Indiquez votre email.")
      .email("Indiquez une adresse email valide (par exemple prenom@exemple.fr).")
      .max(254),
    departement: z.string().trim().max(60).default(""),
    situations: z
      .array(z.enum(valeurs(SITUATIONS_ATELIER)))
      .max(SITUATIONS_ATELIER.length)
      .default([]),
    situationAutre: z.string().trim().max(200).default(""),
    structure: z.string().trim().max(200).default(""),
    motivation: z.string().trim().max(1000, "1 000 caractères au maximum.").default(""),
    accessibilite: z.string().trim().max(500, "500 caractères au maximum.").default(""),
    majeur: z.literal(true, {
      errorMap: () => ({ message: "Les ateliers sont réservés aux personnes de 18 ans et plus." }),
    }),
    consentementOrganisation: z.literal(true, {
      errorMap: () => ({ message: "Votre accord est nécessaire pour organiser l'atelier." }),
    }),
    actualitesIr: z.boolean().default(false),
    actualitesFai: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.situations.includes("autre") && !v.situationAutre)
      ctx.addIssue({
        code: "custom",
        path: ["situationAutre"],
        message: "Précisez votre situation.",
      });
  });

export const envoiInscriptionSchema = z.intersection(inscriptionSchema, antiRobotSchema);
export type Inscription = z.infer<typeof inscriptionSchema>;

/** Erreurs zod à plat, champ par champ, pour l'affichage sous chaque champ. */
export function erreursParChamp(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const cle = String(issue.path[0] ?? "formulaire");
    out[cle] ??= issue.message;
  }
  return out;
}

export function libelle(options: readonly Option[], valeur: string | null | undefined): string {
  if (!valeur) return "";
  if (valeur === NE_PAS_REPONDRE.valeur) return NE_PAS_REPONDRE.libelle;
  return options.find((o) => o.valeur === valeur)?.libelle ?? valeur;
}
