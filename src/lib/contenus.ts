/**
 * Tous les textes visibles du site.
 * Règles d'écriture : phrases courtes, vouvoiement, jamais culpabilisant,
 * aucun deux points ni tiret, formulations épicènes en priorité.
 * Un test (src/test/contenus.test.ts) vérifie l'absence de deux points et de tirets.
 */
import {
  ATELIERS,
  CONTACT_URL,
  DEBAT,
  DERNIER_JOUR_INSCRIPTION,
  formaterCreneau,
  formaterJour,
  CLOTURE_CONSULTATION,
  RESTITUTION_ATELIERS,
  SUPPRESSION_DES_DONNEES_ATELIERS,
  RESPONSABLE_DES_DONNEES,
} from "@/lib/config";

/** Durée d'un parcours complet, mesurée par src/test/duree.test.ts (arrondie à la minute supérieure). */
export const DUREE_CONSULTATION_MINUTES = 7;

export const DATE_LIMITE_INSCRIPTION = formaterJour(DERNIER_JOUR_INSCRIPTION);
export const DATE_FIN_CONSULTATION = formaterJour(CLOTURE_CONSULTATION, true);

export const SITE = {
  titre: "Consultation citoyenne et ateliers · Présidentielle 2027",
  description:
    "Donnez votre avis sur les mesures contre l'inceste et rejoignez un atelier en décembre. Vos propositions seront présentées aux candidats en février 2027.",
  imagePartage: "/og-image.png",
  imagePartageAlt:
    "Consultation citoyenne et ateliers, présidentielle 2027, Institut Rousseau et Face à l'inceste",
};

export const STRUCTURES = {
  ir: {
    nom: "Institut Rousseau",
    site: "https://institut-rousseau.fr",
    presentation:
      "Laboratoire d'idées indépendant fondé en 2020, l'Institut Rousseau réunit environ 1 500 membres autour de la reconstruction écologique, sociale et démocratique. Il organise en février 2027 un débat de politique globale avec les candidats.",
    reseaux: [
      { nom: "LinkedIn", url: "https://www.linkedin.com/company/institrousseau/" },
      { nom: "Instagram", url: "https://instagram.com/institRousseau" },
      { nom: "X", url: "https://twitter.com/InstitRousseau" },
      { nom: "YouTube", url: "https://www.youtube.com/@InstitutRousseau" },
      { nom: "Facebook", url: "https://facebook.com/InstitutRousseau" },
    ],
    newsletter: "https://institut-rousseau.fr",
  },
  fai: {
    nom: "Face à l'inceste",
    site: "https://facealinceste.fr",
    presentation:
      "Créée en 2000, l'association Face à l'inceste défend l'enfance, sensibilise l'opinion, forme les professionnels et agit pour faire évoluer la loi. Elle apporte son expertise et la voix des personnes concernées.",
    reseaux: [
      { nom: "Instagram", url: "https://www.instagram.com/asso_fai/" },
      { nom: "LinkedIn", url: "https://www.linkedin.com/company/facealinceste/" },
      { nom: "Bluesky", url: "https://bsky.app/profile/facealinceste.bsky.social" },
      { nom: "X", url: "https://x.com/Facealinceste" },
      { nom: "Facebook", url: "https://www.facebook.com/Facealinceste/" },
      { nom: "YouTube", url: "https://www.youtube.com/channel/UCxulTDsJlYbJsqVb_XbJxDw" },
    ],
  },
} as const;

export const NAVIGATION = [
  { ancre: "contexte", libelle: "Contexte" },
  { ancre: "agir", libelle: "Consultation" },
  { ancre: "calendrier", libelle: "Ateliers" },
  { ancre: "fevrier", libelle: "Février 2027" },
] as const;

export const ACCUEIL = {
  surtitre: "Présidentielle 2027",
  titre: "Consultation citoyenne et ateliers",
  sousTitre: "Enfance et présidentielle 2027, construisons ensemble les mesures contre l'inceste",
  boutonConsultation: "Je réponds à la consultation citoyenne",
  mentionConsultation: `Anonyme, environ ${DUREE_CONSULTATION_MINUTES} minutes`,
  boutonAteliers: "Je participe aux ateliers de décembre",
  mentionAteliers: `En visio, inscriptions jusqu'au ${DATE_LIMITE_INSCRIPTION}`,
  promesse:
    "Vos réponses et les propositions des ateliers seront présentées aux candidats en février 2027, lors d'un débat organisé par l'Institut Rousseau.",
  consultationClose:
    "La consultation est close, merci. La synthèse sera présentée en février 2027.",
  boutonEntete: "Je réponds",
};

export const CHIFFRES = [
  {
    valeur: "160 000",
    texte: "enfants victimes de violences sexuelles chaque année",
    source: "Source CIIVISE, 2023",
  },
  {
    valeur: "77 %",
    texte: "de ces violences ont lieu au sein de la famille",
    source:
      "Source estimation CIIVISE, reprise par le plan gouvernemental de lutte contre les violences faites aux enfants 2023 2027",
  },
  {
    valeur: "1 sur 10",
    texte: "Un Français sur dix déclare avoir été victime d'inceste",
    source: "Source Ipsos pour Face à l'inceste, septembre 2023",
  },
  {
    valeur: "90 %",
    texte: "des Français sont favorables à l'imprescriptibilité des crimes d'inceste",
    source: "Source Ipsos pour Face à l'inceste, 2025",
  },
];

export const CONTEXTE = {
  titre: "Le contexte, ça bouge en ce moment",
  miseAJour: "2026-11-21",
  frise: [
    {
      date: "Avril 2021",
      texte:
        "La loi du 21 avril 2021 visant à protéger les mineurs des crimes et délits sexuels et de l'inceste pose un premier cadre.",
    },
    {
      date: "Novembre 2023",
      texte:
        "La CIIVISE publie son rapport, fruit de 30 000 témoignages, avec 82 préconisations dont l'imprescriptibilité des viols sur enfants et l'extension de l'inceste aux cousins.",
    },
    {
      date: "Novembre 2025",
      texte:
        "Une proposition de loi déposée au Sénat demande de reconnaître l'inceste comme un crime à part entière.",
    },
    {
      date: "21 juillet 2026",
      texte: "L'Assemblée nationale adopte le projet de loi relatif à la protection des enfants.",
    },
    {
      date: "28 octobre 2026",
      texte:
        "Le Sénat vote l'imprescriptibilité des crimes sexuels commis sur des mineurs, par 252 voix contre 80, alors que sa commission des lois l'avait écartée.",
    },
    {
      date: "3 novembre 2026",
      texte:
        "Le Sénat adopte l'ensemble du texte. Une commission mixte paritaire doit maintenant trouver un texte commun, rien n'est encore définitif.",
    },
  ],
  encadre:
    "Ces avancées existent parce que des victimes, des associations et des citoyens se sont mobilisés. La présidentielle est le prochain rendez vous. Ensemble, nous pouvons changer les choses.",
};

const [a1, a2] = ATELIERS;
export const CRENEAU_1 = formaterCreneau(a1.debut, a1.fin);
export const CRENEAU_2 = formaterCreneau(a2.debut, a2.fin);

export const AGIR = {
  titre: "Deux façons d'agir",
  consultation: {
    titre: "La consultation citoyenne",
    texte: `Choisissez et classez vos priorités parmi 24 mesures contre l'inceste, puis dites nous ce qui manque.`,
    details: [
      `Environ ${DUREE_CONSULTATION_MINUTES} minutes`,
      "Anonyme, sans nom ni email",
      `Ouverte jusqu'au ${DATE_FIN_CONSULTATION}`,
    ],
    bouton: "Je réponds à la consultation",
  },
  ateliers: {
    titre: "Les ateliers de décembre",
    texte:
      "Une heure trente en visio pour échanger avec d'autres citoyens et professionnels, et construire des propositions concrètes.",
    details: [
      `Atelier 1, ${a1.titre}, ${CRENEAU_1}`,
      `Atelier 2, ${a2.titre}, ${CRENEAU_2}`,
      `Inscriptions jusqu'au ${DATE_LIMITE_INSCRIPTION} inclus`,
    ],
    bouton: "Je m'inscris à un atelier",
    clos: "Inscriptions closes",
  },
};

export const CALENDRIER = {
  titre: "Calendrier",
  etapes: [
    { quand: "Décembre 2026", texte: `Ateliers en visio, le ${CRENEAU_1} et le ${CRENEAU_2}` },
    {
      quand: formaterJour(DERNIER_JOUR_INSCRIPTION),
      texte: "Dernier jour pour s'inscrire aux ateliers",
    },
    {
      quand: formaterJour(RESTITUTION_ATELIERS.debut, true),
      texte: `Restitution des ateliers, de 19 h à 20 h, après les Assises de Face à l'inceste du 18 janvier`,
    },
    { quand: DATE_FIN_CONSULTATION, texte: "Fin de la consultation citoyenne" },
    {
      quand: DEBAT.charAt(0).toUpperCase() + DEBAT.slice(1),
      texte: "Débat avec les candidats à la présidentielle, organisé par l'Institut Rousseau",
      ancre: "fevrier",
    },
  ],
};

export const PORTEURS = { titre: "Qui porte la démarche" };

export const AIDE = {
  titre: "Besoin de parler ?",
  intro:
    "Ce sujet peut réveiller des choses difficiles. Vous n'êtes pas seul, des personnes sont là pour vous écouter.",
  numeros: [
    {
      numero: "119",
      nom: "Allô enfance en danger",
      texte: "Gratuit, 24 h sur 24, pour un enfant ou un adulte inquiet pour un enfant",
    },
    { numero: "116 006", nom: "Aide aux victimes", texte: "Gratuit, 7 jours sur 7" },
    { numero: "17", nom: "Police secours", texte: "En cas d'urgence" },
  ],
};

export const FAQ = [
  {
    q: "Mes réponses sont elles anonymes ?",
    r: "Oui. La consultation ne demande ni nom, ni email, ni code postal. Nous ne conservons ni votre adresse IP ni l'heure de votre réponse, seulement le jour. Les questions sur votre profil proposent toutes « Je préfère ne pas répondre ».",
  },
  {
    q: "Combien de temps faut il ?",
    r: `Environ ${DUREE_CONSULTATION_MINUTES} minutes pour la consultation. Un atelier dure une heure trente.`,
  },
  {
    q: "Que deviennent les réponses ?",
    r: "L'Institut Rousseau et Face à l'inceste en font une synthèse. Elle sera présentée aux candidats à la présidentielle en février 2027, lors d'un débat de politique globale organisé par l'Institut Rousseau.",
  },
  {
    q: "Comment se passent les ateliers ?",
    r: "En visio, en petit groupe, avec une animation de l'Institut Rousseau et de Face à l'inceste. Une charte de parole est lue au début. On y écoute sans juger, chacun partage ce qu'il veut, et rien n'est enregistré. Aucune expertise n'est requise.",
  },
  {
    q: "Jusqu'à quand puis je m'inscrire ?",
    r: `Jusqu'au ${DATE_LIMITE_INSCRIPTION} inclus, pour les deux ateliers. Il y a 30 places par atelier, puis une liste d'attente.`,
  },
  {
    q: "Puis je faire les deux ?",
    r: "Oui, et c'est même le plus utile. Répondez à la consultation, puis inscrivez vous à un atelier, ou aux deux.",
  },
];

export const PIED = {
  donnees: "Données personnelles",
  contact: "Nous écrire",
  contactUrl: CONTACT_URL,
};

/* ───────────── Consultation ───────────── */

export const CONSULTATION = {
  titre: "La consultation citoyenne",
  recap: [
    "La CIIVISE a recueilli 30 000 témoignages et formulé 82 préconisations en 2023.",
    "Le 28 octobre 2026, le Sénat a voté l'imprescriptibilité des crimes sexuels sur mineurs, par 252 voix contre 80.",
    "Le texte n'est pas encore définitif, et la présidentielle approche.",
  ],
  accroche: "Votre avis compte, ensemble nous pouvons changer les choses.",
  anonymat: "Cette consultation est anonyme. Nous ne vous demandons ni nom ni email.",
  etapes: ["Qui êtes vous", "Vos priorités", "Pour aller plus loin", "Récapitulatif"],
  profilIntro:
    "Ces questions nous aident à savoir qui a répondu. Chacune propose « Je préfère ne pas répondre ».",
  priorites: {
    intro: "Parmi ces 24 mesures, choisissez les 5 qui comptent le plus pour vous, dans l'ordre.",
    aide: "Touchez une mesure pour l'ajouter à votre classement. Vous pouvez ensuite changer l'ordre ou retirer une mesure.",
    vide: "Aucune mesure choisie pour l'instant.",
    complet: "Vos 5 mesures sont choisies. Vous pouvez encore changer l'ordre.",
    monter: "Monter",
    descendre: "Descendre",
    retirer: "Retirer",
    sources: "Sources",
  },
  plusLoinIntro: "Tout est facultatif.",
  recapIntro: "Relisez vos réponses avant de valider. Vous pouvez revenir en arrière.",
  valider: "Je valide mes réponses",
  suivant: "Continuer",
  retour: "Retour",
  envoi: "Enregistrement…",
  close: "La consultation est close, merci. La synthèse sera présentée en février 2027.",
  merci: "Merci, vos réponses sont bien enregistrées.",
  rebondTitre: "Allez plus loin, rejoignez un atelier en décembre",
  rebondBouton: "Je découvre les ateliers",
};

/* ───────────── Ateliers ───────────── */

export const ATELIERS_PAGE = {
  titre: "Les ateliers de décembre",
  intro: [
    "Un atelier réunit en visio une petite trentaine de personnes, citoyens, parents, professionnels, militants.",
    "Pendant une heure trente, nous partons de ce que vous vivez, voyez ou étudiez pour construire des propositions concrètes.",
    "Ces propositions seront présentées aux candidats en février 2027.",
  ],
  ouvertes: `Inscriptions ouvertes jusqu'au ${DATE_LIMITE_INSCRIPTION} inclus.`,
  closes:
    "Les inscriptions aux ateliers sont closes. Vous pouvez encore répondre à la consultation.",
  boutonConsultation: "Je réponds à la consultation",
  placesRestantes: (n: number) => (n === 1 ? "1 place restante" : `${n} places restantes`),
  complet: "Complet, liste d'attente",
  concerne:
    "Si vous êtes personnellement concerné, vous êtes le bienvenu. Vous n'avez rien à en dire ici, vous pourrez en parler pendant l'atelier si vous le souhaitez.",
  bouton: "Je m'inscris",
  envoi: "Inscription…",
  obligatoire: "obligatoire",
  facultatif: "facultatif",
  merci: "C'est noté, votre inscription est enregistrée.",
  visio: "Nous vous écrirons avant l'atelier avec le lien de la visio.",
  agenda: "Ajouter à mon agenda",
  agendaAide: "Tout y est, l'horaire et votre lien d'annulation",
  lienAnnulation: "Votre lien personnel d'annulation",
  copier: "Copier",
  copie: "Copié",
  rebond: "Pas encore répondu à la consultation ?",
};

export const ANNULATION = {
  titre: "Annuler mon inscription",
  question: (prenom: string) => `Bonjour ${prenom}, vous ne pouvez plus venir ?`,
  explication:
    "Annuler libère votre place pour une personne en liste d'attente. Cette action concerne toutes vos dates.",
  bouton: "J'annule mon inscription",
  fait: "C'est annulé. Merci d'avoir libéré votre place.",
  deja: "Cette inscription est déjà annulée.",
  introuvable: "Ce lien d'annulation ne correspond à aucune inscription.",
  erreur: "L'annulation n'a pas fonctionné. Réessayez dans un instant.",
  perdu: "Un empêchement et plus de lien ? Écrivez nous, nous annulerons pour vous.",
};

export const PARTAGE = {
  titre: "Faites circuler",
  texte: "Plus nous serons nombreux, plus ces propositions pèseront auprès des candidats.",
  message: "Enfance et présidentielle 2027, donnez votre avis sur les mesures contre l'inceste.",
  copier: "Copier le lien",
  copie: "Lien copié",
  natif: "Partager",
};

export const SUIVRE = {
  titre: "Suivez nos travaux",
  newsletter: "Newsletter de l'Institut Rousseau",
};

export const DONNEES = {
  titre: "Données personnelles",
  sections: [
    {
      titre: "Qui est responsable",
      texte: [
        `Le responsable du traitement est ${RESPONSABLE_DES_DONNEES}, qui porte la démarche avec l'association Face à l'inceste.`,
      ],
    },
    {
      titre: "Pourquoi nous collectons des données",
      texte: [
        "La consultation est anonyme. Nous n'enregistrons ni nom, ni email, ni adresse IP, ni l'heure de réponse, seulement le jour. Les réponses servent à préparer une synthèse présentée aux candidats.",
        "L'inscription aux ateliers demande vos coordonnées pour organiser l'atelier et vous envoyer le lien de la visio.",
        "Si vous l'avez accepté, votre email sert aussi à vous envoyer les actualités de l'Institut Rousseau ou de Face à l'inceste, selon vos choix.",
      ],
    },
    {
      titre: "Qui y a accès",
      texte: [
        "Uniquement l'Institut Rousseau et Face à l'inceste. Rien n'est vendu ni transmis à d'autres.",
      ],
    },
    {
      titre: "Combien de temps",
      texte: [
        `Les inscriptions aux ateliers sont supprimées le ${formaterJour(SUPPRESSION_DES_DONNEES_ATELIERS, true)}. Les consentements aux actualités transmis avant cette date restent gérés par chaque structure, et vous pouvez vous désinscrire à tout moment.`,
        "Les réponses anonymes à la consultation sont conservées pour l'analyse.",
        "Pour limiter les envois automatiques, une empreinte chiffrée de votre adresse IP est gardée 24 heures, dans une table à part, jamais reliée à vos réponses.",
      ],
    },
    {
      titre: "Vos droits",
      texte: [
        "Vous pouvez accéder à vos données, les corriger, les supprimer ou vous opposer à leur usage. Vous pouvez aussi saisir la CNIL.",
        "Les réponses à la consultation étant anonymes, nous ne pouvons pas retrouver celle d'une personne.",
      ],
    },
    {
      titre: "Cookies",
      texte: [
        "Aucun traceur publicitaire, aucune mesure d'audience. Le seul cookie sert à la connexion de l'organisatrice au tableau de bord.",
      ],
    },
  ],
  contact: "Pour exercer vos droits, écrivez nous",
};
