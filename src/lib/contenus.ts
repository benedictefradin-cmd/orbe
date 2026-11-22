/**
 * Tous les textes visibles du site.
 * Règles d'écriture : phrases courtes, vouvoiement, jamais culpabilisant,
 * aucun tiret, deux points seulement à la française, pas de petites phrases coupées par une virgule,
 * formulations épicènes en priorité. Un test (src/test/contenus.test.ts) vérifie tirets et deux points.
 */
import {
  ATELIERS,
  CONTACT_URL,
  DEBAT,
  DERNIER_JOUR_INSCRIPTION,
  formaterCreneau,
  formaterHeure,
  formaterJour,
  formaterJourCourt,
  CLOTURE_CONSULTATION,
  RESTITUTION,
  RESTITUTION_ATELIERS,
  SUPPRESSION_DES_DONNEES_ATELIERS,
  RESPONSABLE_DES_DONNEES,
  DATE_RESULTATS,
  SEUIL_COMPTEUR,
  SEUIL_DIFFUSION,
  SUPPRESSION_DES_REPONSES,
  NOMBRE_MESURES_A_CLASSER,
} from "@/lib/config";

/** Durée d'un parcours complet, mesurée par src/test/duree.test.ts (arrondie à la minute supérieure). */
export const DUREE_CONSULTATION_MINUTES = 7;

/** « 11 décembre », sans le jour de la semaine. */
export const DATE_LIMITE_INSCRIPTION = formaterJourCourt(DERNIER_JOUR_INSCRIPTION);
export const DATE_FIN_CONSULTATION = formaterJourCourt(CLOTURE_CONSULTATION);

export const SITE = {
  titre: "Consultation citoyenne et ateliers de réflexion sur la protection de l'enfance",
  description:
    "Donnez votre avis sur la protection de l'enfance et rejoignez un atelier de réflexion en décembre. Vos propositions seront présentées aux candidats à la présidentielle en février 2027.",
  imagePartage: "/og-image.png",
  imagePartageAlt:
    "Consultation citoyenne et ateliers de réflexion sur la protection de l'enfance par l'Institut Rousseau et Face à l'inceste",
};

export const STRUCTURES = {
  ir: {
    nom: "Institut Rousseau",
    site: "https://institut-rousseau.fr",
    presentation:
      "L'Institut Rousseau est un laboratoire d'idées indépendant fondé en 2020. Il réunit environ 1 500 membres autour de la reconstruction écologique, sociale et démocratique. Il organise en février 2027 un débat de politique globale avec les candidats.",
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
      "L'association Face à l'inceste a été créée en 2000. Elle défend l'enfance, sensibilise l'opinion, forme les professionnels et agit pour faire évoluer la loi. Elle apporte son expertise et la voix des personnes concernées.",
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

/** Menu de l'en tête, une entrée par page dédiée. */
export const NAVIGATION = [
  { chemin: "/contexte", libelle: "Contexte" },
  { chemin: "/consultation", libelle: "Consultation" },
  { chemin: "/ateliers", libelle: "Ateliers" },
] as const;

const [a1, a2] = ATELIERS;
export const CRENEAU_1 = formaterCreneau(a1.debut, a1.fin);
export const CRENEAU_2 = formaterCreneau(a2.debut, a2.fin);

/* ───────────── Accueil, courte, trois entrées ───────────── */

export const ACCUEIL = {
  surtitre: "Présidentielle 2027",
  titre: "Consultation citoyenne et ateliers de réflexion sur la protection de l'enfance",
  /** Passages du titre mis en valeur par un soulignement. */
  titreSouligne: ["Consultation citoyenne", "ateliers"],
  accroche: "Votre avis compte.",
  intro:
    "La protection de l'enfance est trop souvent écartée des débats. Les enfants ont droit à la justice, à des mesures concrètes et à être protégés. Enfance et Présidentielle 2027 : construisons ensemble les mesures qui protègeront nos enfants demain. Vos propositions seront présentées aux candidats à la présidentielle en février 2027.",
  appel:
    "Pour que vos idées en fassent partie : répondez à la consultation citoyenne et participez aux ateliers de réflexion.",
  cloture: `Les inscriptions seront clôturées le ${DATE_LIMITE_INSCRIPTION}.`,
  restant: (jours: number) =>
    jours > 1 ? `Plus que ${jours} jours` : jours === 1 ? "Dernier jour" : "",
  entrees: {
    contexte: {
      titre: "Les avancées d'hier et les enjeux de demain",
    },
    consultation: {
      titre: "Je veux participer à la consultation citoyenne",
      titreClos: "La consultation citoyenne",
      close:
        "La consultation est close. Merci pour votre participation. La synthèse sera présentée en février 2027.",
    },
    ateliers: {
      titre: "Je veux participer aux ateliers",
      titreClos: "Les ateliers de réflexion",
      clos: "Inscriptions closes",
    },
  },
};

/* ───────────── Page contexte ───────────── */

export const CHIFFRES = [
  {
    valeur: "160 000",
    texte: "enfants victimes de violences sexuelles chaque année",
    source: "Source CIIVISE (2023)",
  },
  {
    valeur: "77 %",
    texte: "de ces violences ont lieu au sein de la famille",
    source:
      "Source estimation CIIVISE reprise par le plan gouvernemental de lutte contre les violences faites aux enfants 2023 2027",
  },
  {
    valeur: "1 sur 10",
    texte:
      "Une personne sur dix en France déclare avoir subi des violences sexuelles dans sa famille",
    source: "Source Ipsos pour Face à l'inceste (septembre 2023)",
  },
  {
    valeur: "90 %",
    texte:
      "des Français sont favorables à l'imprescriptibilité des violences sexuelles commises sur des enfants dans la famille",
    source: "Source Ipsos pour Face à l'inceste (2025)",
  },
];

export const CONTEXTE = {
  surtitre: "Le contexte",
  titre: "Protéger les enfants : un enjeu de la présidentielle 2027",
  intro:
    "Chaque année en France, des dizaines de milliers d'enfants subissent des violences, le plus souvent de la part de proches. La loi progresse, mais beaucoup reste à faire pour les repérer, les protéger, les soigner et rendre justice.",
  chiffresTitre: "Quelques chiffres",
  loiTitre: "Ce qui bouge en ce moment",
  miseAJour: "2026-11-21",
  friseEnCours: "En cours",
  frise: [
    {
      date: "Avril 2021",
      texte:
        "La loi du 21 avril 2021 renforce la protection des mineurs contre les violences sexuelles et pose un premier cadre.",
    },
    {
      date: "Novembre 2023",
      texte:
        "La CIIVISE publie son rapport. Il s'appuie sur 30 000 témoignages et formule 82 préconisations. Parmi elles figurent l'imprescriptibilité des viols sur enfants et une meilleure prise en compte des violences commises au sein de la famille.",
    },
    {
      date: "Novembre 2025",
      texte:
        "Une proposition de loi déposée au Sénat demande de reconnaître les violences sexuelles commises sur un enfant par un membre de sa famille comme un crime à part entière.",
    },
    {
      date: "21 juillet 2026",
      texte: "L'Assemblée nationale adopte le projet de loi relatif à la protection des enfants.",
    },
    {
      date: "28 octobre 2026",
      texte:
        "Le Sénat vote l'imprescriptibilité des crimes sexuels commis sur des mineurs par 252 voix contre 80. Sa commission des lois l'avait pourtant écartée.",
    },
    {
      date: "3 novembre 2026",
      texte:
        "Le Sénat adopte l'ensemble du texte. Une commission mixte paritaire doit maintenant trouver un texte commun. Rien n'est encore définitif.",
    },
  ],
  encadre:
    "Ces avancées existent parce que des victimes, des associations et des citoyens se sont mobilisés. La présidentielle est le prochain rendez vous. Ensemble nous pouvons changer les choses.",
  pourquoiConsultation: {
    titre: "Pourquoi une consultation citoyenne",
    textes: [
      "La protection de l'enfance concerne tout le monde. Parents, proches, professionnels ou personnes concernées : chacun voit les choses depuis sa place.",
      "La consultation permet de recueillir largement vos priorités parmi 24 mesures issues des travaux de la CIIVISE, des associations et du débat parlementaire. Vous pouvez aussi proposer ce qui manque.",
      "Les priorités qui ressortent de la consultation orienteront le travail des ateliers.",
      `Elle est anonyme (environ ${DUREE_CONSULTATION_MINUTES} minutes) et reste ouverte jusqu'au ${DATE_FIN_CONSULTATION}.`,
    ],
    bouton: "Je réponds à la consultation",
  },
  pourquoiAteliers: {
    titre: "Pourquoi des ateliers de réflexion",
    textes: [
      "La consultation nous permet d'orienter vos priorités pour les ateliers. Ces ateliers permettent d'aller plus loin, d'échanger et de construire des propositions concrètes et applicables.",
      "Deux ateliers d'une heure trente se tiennent en visio en petit groupe.",
      `Atelier 1 : ${a1.titre} (${CRENEAU_1})`,
      `Atelier 2 : ${a2.titre} (${CRENEAU_2})`,
      "Aucune expertise n'est requise. Une charte de parole est lue au début. On y écoute sans juger et rien n'est enregistré.",
    ],
    bouton: "Je m'inscris aux ateliers",
    clos: "Les inscriptions aux ateliers sont closes.",
  },
  aQuoiCaSert: {
    titre: "À quoi cela va servir",
    texte:
      "L'Institut Rousseau et Face à l'inceste rassemblent les réponses et les propositions dans une synthèse. Elle sera présentée aux candidats à la présidentielle en février 2027 lors d'un débat organisé par l'Institut Rousseau.",
  },
};

export const CALENDRIER = {
  titre: "Le calendrier",
  etapes: [
    {
      quand: formaterJour(DERNIER_JOUR_INSCRIPTION),
      texte: "Dernier jour pour répondre à la consultation et s'inscrire aux ateliers",
    },
    { quand: "Décembre 2026", texte: `Ateliers en visio le ${CRENEAU_1} et le ${CRENEAU_2}` },
    {
      quand: formaterJour(RESTITUTION_ATELIERS.debut, true),
      texte: `Restitution des ateliers de ${formaterHeure(RESTITUTION_ATELIERS.debut)} à ${formaterHeure(RESTITUTION_ATELIERS.fin)} après les Assises de Face à l'inceste du 18 janvier`,
    },
    {
      quand: DEBAT.charAt(0).toUpperCase() + DEBAT.slice(1),
      texte: "Débat avec les candidats à la présidentielle, organisé par l'Institut Rousseau",
    },
  ],
};

export const PORTEURS = { titre: "Qui porte la démarche" };

export const AIDE = {
  titre: "Besoin de parler ?",
  intro: "Ce sujet peut réveiller des choses difficiles. Des personnes sont là pour vous écouter.",
  numeros: [
    {
      numero: "119",
      nom: "Allô enfance en danger",
      texte: "Gratuit et joignable 24h sur 24 pour un enfant ou un adulte inquiet pour un enfant",
    },
    { numero: "116 006", nom: "Aide aux victimes", texte: "Gratuit et joignable 7 jours sur 7" },
    { numero: "17", nom: "Police secours", texte: "En cas d'urgence" },
  ],
};

export const FAQ = [
  {
    q: "Mes réponses sont elles anonymes ?",
    r: "Oui. La consultation ne demande ni nom, ni email, ni code postal. Nous ne conservons ni votre adresse IP ni l'heure de votre réponse. Seul le jour est gardé. Les questions sur votre profil proposent toutes « Je préfère ne pas répondre ». À la fin, vous pouvez laisser votre email pour connaître la suite. Il est enregistré à part et jamais relié à vos réponses.",
  },
  {
    q: "Puis je répondre plusieurs fois ?",
    r: "Non. La consultation accepte une seule réponse par personne. Relisez vos réponses avant de valider. Vous pouvez revenir en arrière jusqu'au dernier moment.",
  },
  {
    q: "Combien de temps faut il ?",
    r: `Environ ${DUREE_CONSULTATION_MINUTES} minutes pour la consultation. Un atelier dure une heure trente.`,
  },
  {
    q: "Jusqu'à quand puis je m'inscrire aux ateliers ?",
    r: `Jusqu'au ${DATE_LIMITE_INSCRIPTION} pour les deux ateliers. Chaque atelier compte 30 places. Une liste d'attente prend ensuite le relais.`,
  },
  {
    q: "Puis je faire les deux ?",
    r: "Oui. C'est même le plus utile. Répondez à la consultation puis inscrivez vous à un atelier ou aux deux.",
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
  /** Ligne neutre : aucune mesure n'est citée avant le classement (le contexte reste sur /contexte). */
  recap: [`4 étapes. Environ ${DUREE_CONSULTATION_MINUTES} minutes. Anonyme.`],
  accroche: "Votre avis compte. Ensemble nous pouvons changer les choses.",
  anonymat:
    "Cette consultation est anonyme. Nous ne vous demandons ni nom ni email pour répondre. Une seule réponse par personne.",
  ouverture: "Ouvert à partir de 15 ans.",
  /** Questionnaire v2 : le cœur du sujet d'abord, les questions sur la personne ensuite. */
  etapes: ["Vos priorités", "Vos idées", "Quelques mots sur vous", "Relecture"] as const,
  profilIntro:
    "Ces questions nous aident à savoir qui a répondu. Chacune propose « Je préfère ne pas répondre ».",
  moins15: {
    titre: "Merci pour votre intérêt",
    textes: [
      "Cette consultation est ouverte à partir de 15 ans. Vos réponses ne seront pas enregistrées.",
      "Si quelque chose vous inquiète ou vous fait du mal, vous pouvez en parler. Le 119 est gratuit et joignable 24h sur 24. Vous pouvez aussi vous confier à un adulte de confiance.",
    ],
    appeler: "Appeler le 119",
  },
  erreurs: {
    aCompleter: "Certaines réponses sont à compléter.",
    technique:
      "L'enregistrement n'a pas fonctionné. Vos réponses sont toujours là. Réessayez dans un instant.",
    suiteTechnique: "L'enregistrement n'a pas fonctionné. Réessayez dans un instant.",
  },
  relecture: {
    modifier: "Modifier",
    modifierPriorites: " vos priorités",
    modifierIdees: " vos idées",
    modifierProfil: " vos réponses sur vous",
    pasDeReponse: "Pas de réponse",
    consentementDonne: "Accord donné pour les statistiques",
  },
  priorites: {
    intro:
      "Choisissez parmi ces 24 mesures les 5 qui comptent le plus pour vous. Classez les par ordre d'importance.",
    aide: "Touchez une mesure pour l'ajouter à votre classement. Vous pouvez ensuite changer l'ordre ou retirer une mesure.",
    ordre: "Les mesures sont présentées dans un ordre tiré au hasard pour chaque personne.",
    titreClassement: (n: number, total: number) => `Mon classement (${n} sur ${total})`,
    titreListe: "Les 24 mesures",
    chargement: "Préparation de la liste des mesures…",
    vide: "Aucune mesure choisie pour l'instant.",
    complet: "Vos 5 mesures sont choisies. Vous pouvez encore changer l'ordre.",
    aChoisir: "À choisir",
    monter: "Monter",
    descendre: "Descendre",
    retirer: "Retirer",
    sources: "Sources",
    details: "Détails",
    filtres: "Afficher les mesures par thème",
    tousLesAxes: "Tous les thèmes",
    affichees: (n: number) => (n === 1 ? "1 mesure affichée." : `${n} mesures affichées.`),
    resume: (n: number, total: number) => `${n} sur ${total} choisies`,
    voirClassement: "Voir mon classement",
    annonces: {
      ajout: (position: number, total: number, texte: string) =>
        `Ajoutée en position ${position} sur ${total} : ${texte}`,
      deplacement: (position: number, total: number, texte: string) =>
        `Déplacée en position ${position} sur ${total} : ${texte}`,
      retrait: (texte: string) => `Retirée de votre classement : ${texte}`,
      plein: "Votre classement est complet. Retirez une mesure pour en choisir une autre.",
      dejaPremiere: "Cette mesure est déjà en première position.",
      dejaDerniere: "Cette mesure est déjà en dernière position.",
    },
  },
  ideesIntro: "Tout est facultatif.",
  recapIntro: "Relisez vos réponses avant de valider. Vous pouvez revenir en arrière.",
  valider: "Je valide mes réponses",
  suivant: "Continuer",
  retour: "Retour",
  envoi: "Enregistrement…",
  close:
    "La consultation est close. Merci pour votre participation. La synthèse sera présentée en février 2027.",
  merci:
    "Merci. Vos réponses sont bien enregistrées. Inscrivez vous aux ateliers pour en discuter.",
  /** Écran de fin, affiché uniquement après la confirmation du serveur. */
  fin: {
    vosPriorites: "Vos 5 priorités",
    rang: (n: number) => `Vous êtes la ${n.toLocaleString("fr-FR")}e personne à répondre.`,
    ensuiteTitre: "Et maintenant",
    ensuite: [
      `La consultation reste ouverte jusqu'au ${DATE_FIN_CONSULTATION}.`,
      `L'Institut Rousseau et Face à l'inceste rassemblent ensuite toutes les réponses dans une synthèse. Elle sera présentée aux candidates et candidats à la présidentielle lors du débat organisé par l'Institut Rousseau en ${DEBAT}.`,
    ],
    /** Affiché seulement si DATE_RESULTATS est renseignée dans config.ts. */
    resultats: DATE_RESULTATS
      ? `Les résultats seront publiés le ${formaterJour(DATE_RESULTATS, true)}.`
      : "",
    methode: "Comment les réponses sont analysées",
  },
  rebondTitre: "Allez plus loin : rejoignez un atelier de réflexion en décembre",
  rebondBouton: "Je découvre les ateliers",
  dejaRepondu: {
    titre: "Merci pour votre participation",
    texte:
      "Une réponse a déjà été envoyée depuis ce navigateur. La consultation accepte une seule réponse par personne.",
  },
  suite: {
    titre: "Connaître la suite",
    texte: `Laissez votre email si vous souhaitez recevoir la synthèse présentée ${RESTITUTION} et l'invitation au débat.`,
    separe: `Votre email est enregistré à part. Il n'est jamais relié à vos réponses. Il est supprimé le ${formaterJour(SUPPRESSION_DES_DONNEES_ATELIERS, true)}.`,
    libelle: "Votre email",
    bouton: "Je veux connaître la suite",
    envoi: "Enregistrement…",
    merci: "C'est noté. Nous vous écrirons pour la restitution.",
  },
};

/* ───────────── Ateliers ───────────── */

export const ATELIERS_PAGE = {
  titre: "Les ateliers de réflexion",
  intro: [
    "Un atelier réunit en visio une petite trentaine de personnes : citoyens, parents, professionnels et militants.",
    "Les priorités issues de la consultation orientent le travail de chaque atelier.",
    "Pendant une heure trente, nous partons de ce que vous vivez, voyez ou étudiez pour construire des propositions concrètes.",
    "Ces propositions seront présentées aux candidats en février 2027.",
  ],
  ouvertes: `Inscriptions ouvertes jusqu'au ${DATE_LIMITE_INSCRIPTION}.`,
  closes: "Les inscriptions aux ateliers sont closes. Merci pour votre intérêt.",
  boutonConsultation: "Je réponds à la consultation",
  placesRestantes: (n: number) => (n === 1 ? "1 place restante" : `${n} places restantes`),
  complet: "Complet (liste d'attente)",
  concerne:
    "Les personnes concernées sont les bienvenues. Vous n'avez rien à en dire ici. Vous pourrez en parler pendant l'atelier si vous le souhaitez.",
  bouton: "Je m'inscris",
  envoi: "Inscription…",
  obligatoire: "obligatoire",
  facultatif: "facultatif",
  merci: "C'est noté. Votre inscription est enregistrée.",
  visio: "Nous vous écrirons avant l'atelier avec le lien de la visio.",
  agenda: "Ajouter à mon agenda",
  agendaAide: "L'horaire et votre lien d'annulation y figurent",
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
  perdu: "Un empêchement et plus de lien ? Écrivez nous et nous annulerons pour vous.",
};

/** Compteur public, affiché seulement au dessus du seuil (voir config.ts). */
export const COMPTEUR = {
  texte: (n: number) => `Plus de ${n.toLocaleString("fr-FR")} personnes ont déjà répondu`,
};

/* ───────────── Méthode (textes provisoires, docs/refonte/a-valider.md) ───────────── */

export const METHODE = {
  titre: "La méthode de la consultation",
  lienPied: "Méthode",
  lienConsultation: "Comment vos réponses sont analysées",
  retour: "Retour à la consultation",
  intro:
    "Cette page explique d'où viennent les 24 mesures et comment les réponses sont comptées. Elle sera complétée si la méthode évolue.",
  sections: [
    {
      titre: "D'où viennent les 24 mesures",
      textes: [
        "Les 24 mesures ont été choisies par l'Institut Rousseau et l'association Face à l'inceste.",
        "Elles reprennent des préconisations du rapport de la CIIVISE (novembre 2023), des propositions de Face à l'inceste et des propositions issues des travaux d'une commission de l'Assemblée nationale. Les sources de chaque mesure sont indiquées sous son texte.",
        "Vous pouvez aussi proposer une mesure qui manque. Toutes les propositions sont lues.",
      ],
    },
    {
      titre: "Comment les résultats sont calculés",
      textes: [
        `Chaque personne classe ${NOMBRE_MESURES_A_CLASSER} mesures. Une mesure classée en première position reçoit 5 points. La deuxième reçoit 4 points et ainsi de suite jusqu'à la cinquième (1 point). Les points de toutes les réponses sont additionnés (méthode de Borda).`,
        "Pour chaque mesure, nous indiquons aussi la part des personnes qui l'ont retenue dans leurs 5 priorités.",
        "Vous pouvez signaler jusqu'à 3 mesures que vous ne soutenez pas. Le score net d'une mesure est le nombre de personnes qui l'ont retenue moins le nombre de personnes qui ne la soutiennent pas. Cette question a été ajoutée en cours de consultation. Le score net ne porte que sur les réponses qui l'ont vue.",
        "Deux mesures à égalité de points partagent le même rang. Aucune n'est avantagée.",
      ],
    },
    {
      titre: "Qui a répondu",
      textes: [
        "Les personnes qui répondent ne forment pas un échantillon représentatif de la population. Les résultats disent ce que pensent les personnes qui ont choisi de participer. Ce n'est pas un sondage.",
        "Les questions sur votre profil servent à décrire qui a répondu. Elles proposent toutes « Je préfère ne pas répondre ».",
      ],
    },
    {
      titre: "Un ordre tiré au hasard",
      textes: [
        "Les 24 mesures s'affichent dans un ordre tiré au hasard pour chaque personne. Aucune mesure n'est avantagée par sa place dans la liste.",
        "Cet ordre est enregistré avec la réponse. Il permet de vérifier qu'il n'a pas pesé sur les choix.",
        "Les mesures en tête ne sont jamais affichées pendant la consultation, pour ne pas influencer les réponses.",
      ],
    },
    {
      titre: "Les réponses en double",
      textes: [
        "La consultation accepte une seule réponse par navigateur. Un cookie technique, sans identifiant, le vérifie.",
        "Chaque formulaire reçoit un jeton à usage unique. Le même envoi ne peut donc pas être enregistré deux fois. Les jetons utilisés sont gardés à part, sans lien avec les réponses, et supprimés après la clôture.",
        "Les réponses strictement identiques sont repérées. Les résultats sont calculés avec et sans elles.",
      ],
    },
    {
      titre: "Les textes libres",
      textes: [
        "Les propositions écrites librement sont relues avant toute citation. Tout élément qui pourrait permettre de reconnaître une personne est retiré.",
      ],
    },
    {
      titre: "Ce qui est publié",
      textes: [
        `Aucun chiffre portant sur moins de ${SEUIL_DIFFUSION} réponses n'est publié.`,
        `Le nombre de réponses n'est affiché qu'à partir de ${SEUIL_COMPTEUR} réponses. Il est arrondi à la dizaine inférieure.`,
      ],
    },
  ],
};

/* ───────────── Résultats (page fermée tant que RESULTATS_PUBLICS est faux) ───────────── */

export const RESULTATS = {
  titre: "Les résultats de la consultation",
  total: (n: number) => `Plus de ${n.toLocaleString("fr-FR")} réponses`,
  avertissement:
    "Les personnes qui ont répondu ne forment pas un échantillon représentatif. Les cases de moins de 10 réponses sont masquées.",
  colonnes: {
    rang: "Rang",
    mesure: "Mesure",
    points: "Points",
    part: "Retenue par",
    net: "Score net",
  },
  exAequo: "ex aequo",
  masque: "Moins de 10",
  methode: "Comprendre le calcul",
};

export const PARTAGE = {
  titre: "Faites circuler",
  texte: "Plus nous serons nombreux, plus ces propositions pèseront auprès des candidats.",
  message: "Présidentielle 2027 : donnez votre avis sur la protection de l'enfance.",
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
        "Après la consultation, vous pouvez laisser votre email pour connaître la suite (synthèse et débat). Il est enregistré dans une liste à part, sans lien avec vos réponses. Il sert uniquement à vous écrire pour la restitution.",
      ],
    },
    {
      titre: "Sur quelle base",
      texte: [
        "Vous répondez à la consultation et vous vous inscrivez aux ateliers de votre plein gré. Le traitement repose sur votre consentement.",
        "La consultation est ouverte à partir de 15 ans. Aucune réponse n'est enregistrée pour une personne de moins de 15 ans.",
      ],
    },
    {
      titre: "La réponse « personne concernée »",
      texte: [
        "Indiquer que vous avez subi des violences sexuelles dans l'enfance est facultatif. Cette information est sensible. Elle n'est enregistrée que si vous cochez la case d'accord qui apparaît à côté. Sans cet accord, rien n'est enregistré.",
        "Elle sert uniquement aux statistiques de la synthèse. Elle n'est jamais publiée pour un groupe de moins de 10 personnes.",
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
        `Les inscriptions aux ateliers et les emails laissés pour connaître la suite sont supprimés le ${formaterJour(SUPPRESSION_DES_DONNEES_ATELIERS, true)}. Les consentements aux actualités transmis avant cette date restent gérés par chaque structure. Vous pouvez vous désinscrire à tout moment.`,
        SUPPRESSION_DES_REPONSES
          ? `Les réponses anonymes à la consultation sont conservées pour l'analyse. Elles sont supprimées le ${formaterJour(SUPPRESSION_DES_REPONSES, true)}.`
          : "Les réponses anonymes à la consultation sont conservées pour l'analyse. La date de leur suppression sera indiquée ici dès qu'elle sera fixée.",
        "Une empreinte chiffrée de votre adresse IP est gardée 24 heures pour limiter les envois automatiques. Elle est stockée à part et jamais reliée à vos réponses.",
        "Une empreinte chiffrée du jeton de votre formulaire est gardée jusqu'au lendemain de la clôture. Elle empêche d'enregistrer deux fois le même envoi. Elle est stockée à part et jamais reliée à vos réponses.",
      ],
    },
    {
      titre: "Vos droits",
      texte: [
        "Vous pouvez accéder à vos données, les corriger, les supprimer ou vous opposer à leur usage. Vous pouvez aussi saisir la CNIL.",
        "Les réponses à la consultation sont anonymes. Rien ne relie une réponse à la personne qui l'a envoyée. Nous ne pouvons donc ni la retrouver, ni la modifier, ni la supprimer à votre demande.",
      ],
    },
    {
      titre: "Cookies",
      texte: [
        "Ce site n'utilise aucun traceur publicitaire ni mesure d'audience.",
        "Après votre réponse, un cookie technique indique seulement qu'une réponse a été envoyée depuis ce navigateur. Il évite les réponses en double. Il ne contient aucun identifiant et ne permet pas de retrouver vos réponses. Il expire à la clôture de la consultation.",
        "Un autre cookie sert à la connexion de l'organisatrice au tableau de bord.",
      ],
    },
  ],
  contact: "Écrivez nous pour exercer vos droits",
};
