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

/** Descriptions des pages pour les moteurs de recherche et les partages (150 à 160 caractères, vérifié par un test). */
export const META = {
  accueil:
    "Protéger les enfants des violences sexuelles. Choisissez vos 5 priorités parmi 24 mesures. Synthèse remise aux candidates et candidats à la présidentielle 2027.",
  contexte:
    "Imprescriptibilité, rapport de la CIIVISE, vote du Sénat. Où en est la loi sur les violences sexuelles faites aux enfants et ce qui reste à construire en 2027.",
  consultation: `Consultation anonyme (environ ${DUREE_CONSULTATION_MINUTES} minutes). Classez les 5 mesures qui comptent le plus pour vous et proposez ce qui manque. Ouvert jusqu'au ${DATE_FIN_CONSULTATION}.`,
  ateliers: `Deux ateliers gratuits de 1h30 en visio (${formaterJourCourt(ATELIERS[0].debut.slice(0, 10))} et ${formaterJourCourt(ATELIERS[1].debut.slice(0, 10))}). En petit groupe, vos priorités deviennent des propositions concrètes. Aucun prérequis.`,
  donneesPersonnelles:
    "Ce que nous collectons, pourquoi et combien de temps. Réponses anonymes, aucun traceur publicitaire, aucune vente de données. Vos droits et comment les exercer.",
};

export const SITE = {
  titre: "Enfance et présidentielle 2027 · Vos 5 priorités",
  description:
    "Choisissez vos 5 priorités pour protéger les enfants des violences sexuelles. La synthèse sera remise aux candidates et candidats à la présidentielle en février 2027.",
  imagePartage: "/og-image.png",
  imagePartageAlt:
    "Consultation citoyenne et ateliers de réflexion sur la protection de l'enfance par l'Institut Rousseau et Face à l'inceste",
};

export const STRUCTURES = {
  ir: {
    nom: "Institut Rousseau",
    site: "https://institut-rousseau.fr",
    presentation:
      "L'Institut Rousseau est un laboratoire d'idées indépendant fondé en 2020. Il réunit environ 1 500 membres autour de la reconstruction écologique, sociale et démocratique. Il organise en février 2027 un débat de politique globale avec les candidates et candidats.",
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
      "L'association Face à l'inceste a été créée en 2000. Elle défend l'enfance, sensibilise l'opinion, forme les professionnelles et professionnels et agit pour faire évoluer la loi. Elle apporte son expertise et la voix des personnes concernées.",
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
  titre: "Construisons ensemble ce qui protègera nos enfants demain.",
  /** Passages du titre mis en valeur par un soulignement. */
  titreSouligne: ["ensemble"],
  /** N'est plus affichée (retrait par le prompt 4). Clé gardée. */
  accroche: "Votre avis compte.",
  intro:
    "Choisissez vos 5 priorités parmi 24 mesures. La synthèse sera remise aux candidates et candidats à la présidentielle en février 2027.",
  appel: `Anonyme (environ ${DUREE_CONSULTATION_MINUTES} minutes). Deux ateliers en visio prolongent l'échange en décembre.`,
  cloture: `Ouvert jusqu'au ${DATE_LIMITE_INSCRIPTION}.`,
  restant: (jours: number) =>
    jours > 1 ? `Encore ${jours} jours` : jours === 1 ? "Dernier jour" : "",
  entrees: {
    contexte: {
      titre: "Où en est la loi",
    },
    consultation: {
      titre: "Je choisis mes 5 priorités",
      titreClos: "La consultation citoyenne",
      close:
        "La consultation est close. Merci à toutes les personnes qui ont répondu. La synthèse sera remise en février 2027.",
    },
    ateliers: {
      titre: "Je rejoins un atelier",
      titreClos: "Les ateliers",
      clos: "Inscriptions closes",
    },
  },
};

/* ───────────── Page contexte ───────────── */

export const CHIFFRES = [
  {
    valeur: "160 000",
    texte: "enfants subissent des violences sexuelles chaque année",
    source: "Source CIIVISE (2023)",
  },
  {
    valeur: "77 %",
    texte: "de ces violences ont lieu au sein de la famille",
    source:
      "Source estimation CIIVISE reprise par le plan gouvernemental de lutte contre les violences faites aux enfants 2023 2027",
  },
  {
    valeur: "1 personne sur 10",
    texte: "en France déclare avoir subi des violences sexuelles dans sa famille",
    source: "Source Ipsos pour Face à l'inceste (septembre 2023)",
  },
  {
    valeur: "90 %",
    texte:
      "des personnes interrogées sont favorables à l'imprescriptibilité des violences sexuelles commises sur des enfants dans la famille",
    source: "Source Ipsos pour Face à l'inceste (2025)",
  },
];

export const CONTEXTE = {
  surtitre: "Le contexte",
  titre: "Protéger les enfants : un enjeu de la présidentielle 2027",
  intro:
    "La loi progresse. Repérer, protéger, soigner et rendre justice reste un chantier. Il se construit avec vous.",
  chiffresTitre: "Quelques chiffres",
  loiTitre: "Ce qui bouge en ce moment",
  miseAJour: "2026-11-21",
  friseEnCours: "En cours",
  frise: [
    {
      date: "Avril 2021",
      texte:
        "La loi du 21 avril 2021 pose un premier cadre contre les violences sexuelles sur mineurs.",
    },
    {
      date: "Novembre 2023",
      texte:
        "La CIIVISE tire 82 préconisations de 30 000 témoignages (dont l'imprescriptibilité des viols sur enfants et une meilleure prise en compte des violences dans la famille).",
    },
    {
      date: "Novembre 2025",
      texte:
        "Une proposition de loi au Sénat veut faire des violences sexuelles sur un enfant par un membre de sa famille un crime à part entière.",
    },
    {
      date: "21 juillet 2026",
      texte: "L'Assemblée nationale adopte le projet de loi relatif à la protection des enfants.",
    },
    {
      date: "28 octobre 2026",
      texte:
        "Le Sénat vote l'imprescriptibilité des crimes sexuels sur mineurs (252 voix contre 80).",
    },
    {
      date: "3 novembre 2026",
      texte:
        "Le Sénat adopte le texte. Une commission mixte paritaire doit trouver un accord. Rien n'est encore acquis.",
    },
  ],
  encadre:
    "Ces avancées sont nées de la mobilisation des personnes concernées, des associations, des citoyennes et des citoyens. La présidentielle est la prochaine étape.",
  pourquoiConsultation: {
    titre: "Pourquoi une consultation citoyenne",
    textes: [
      "Parents, proches, professionnelles et professionnels, personnes concernées. Chacune et chacun voit le sujet depuis sa place.",
      "Vous classez 5 mesures parmi 24, issues de la CIIVISE, des associations et du débat parlementaire. Vous pouvez proposer ce qui manque.",
      `Anonyme (environ ${DUREE_CONSULTATION_MINUTES} minutes). Ouvert jusqu'au ${DATE_FIN_CONSULTATION}.`,
    ],
    bouton: "Je choisis mes 5 priorités",
  },
  pourquoiAteliers: {
    titre: "Pourquoi des ateliers de réflexion",
    textes: [
      "Vos priorités servent de point de départ. En petit groupe, elles deviennent des propositions concrètes.",
      "Deux ateliers de 1h30 en visio.",
      `Atelier 1 : ${a1.titre} (${CRENEAU_1})`,
      `Atelier 2 : ${a2.titre} (${CRENEAU_2})`,
      "Aucune expertise requise. Une charte de parole est lue au début. On y écoute sans juger et rien n'est enregistré.",
    ],
    bouton: "Je rejoins un atelier",
    clos: "Les inscriptions aux ateliers sont closes.",
  },
  aQuoiCaSert: {
    titre: "À quoi cela va servir",
    texte:
      "Réponses et propositions forment une synthèse. Elle sera remise aux candidates et candidats lors du débat de l'Institut Rousseau en février 2027.",
  },
};

export const CALENDRIER = {
  titre: "Le calendrier",
  etapes: [
    {
      quand: formaterJour(DERNIER_JOUR_INSCRIPTION),
      texte: "Dernier jour pour répondre et s'inscrire aux ateliers",
    },
    { quand: "Décembre 2026", texte: `Ateliers en visio le ${CRENEAU_1} et le ${CRENEAU_2}` },
    {
      quand: formaterJour(RESTITUTION_ATELIERS.debut, true),
      texte: `Restitution des ateliers de ${formaterHeure(RESTITUTION_ATELIERS.debut)} à ${formaterHeure(RESTITUTION_ATELIERS.fin)} après les Assises de Face à l'inceste du 18 janvier`,
    },
    {
      quand: DEBAT.charAt(0).toUpperCase() + DEBAT.slice(1),
      texte: "Débat de l'Institut Rousseau avec les candidates et candidats",
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
      texte:
        "Gratuit et joignable 24h sur 24 pour un enfant ou une personne adulte inquiète pour un enfant",
    },
    { numero: "116 006", nom: "Aide aux victimes", texte: "Gratuit et joignable 7 jours sur 7" },
    { numero: "17", nom: "Police secours", texte: "En cas d'urgence" },
  ],
};

export const FAQ = [
  {
    q: "Mes réponses sont elles anonymes ?",
    r: "Oui. Ni nom, ni email, ni code postal, ni adresse IP. Seul le jour de réponse est gardé. L'email laissé pour connaître la suite est enregistré à part. Il n'est jamais relié à vos réponses.",
  },
  {
    q: "Puis je répondre plusieurs fois ?",
    r: "Non. Une seule réponse par personne. Tout reste modifiable jusqu'à l'envoi.",
  },
  {
    q: "Combien de temps faut il ?",
    r: `Environ ${DUREE_CONSULTATION_MINUTES} minutes pour la consultation. Un atelier dure 1h30.`,
  },
  {
    q: "Jusqu'à quand puis je m'inscrire aux ateliers ?",
    r: `Jusqu'au ${DATE_LIMITE_INSCRIPTION}. Chaque atelier compte 30 places. Une liste d'attente prend ensuite le relais.`,
  },
  {
    q: "Puis je faire les deux ?",
    r: "Oui. C'est même le plus utile.",
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
  accroche: "Chaque réponse compte dans la synthèse.",
  anonymat: "Cette consultation est anonyme. Ni nom ni email. Une seule réponse par personne.",
  ouverture: "Ouvert à partir de 15 ans.",
  /** Questionnaire v2 : le cœur du sujet d'abord, les questions sur la personne ensuite. */
  etapes: ["Vos priorités", "Vos idées", "Quelques mots sur vous", "Relecture"] as const,
  profilIntro:
    "Ces questions servent aux statistiques de la synthèse. Chacune propose « Je préfère ne pas répondre ».",
  moins15: {
    titre: "Merci pour votre intérêt",
    textes: [
      "Cette consultation est ouverte à partir de 15 ans. Vos réponses ne seront pas enregistrées.",
      "Si quelque chose vous inquiète ou vous fait du mal, vous pouvez en parler. Le 119 est gratuit et joignable 24h sur 24. Vous pouvez aussi vous confier à un adulte de confiance.",
    ],
    appeler: "Appeler le 119",
  },
  erreurs: {
    aCompleter: "Quelques réponses manquent. Elles sont signalées plus bas.",
    technique:
      "L'envoi n'a pas abouti. Vos réponses sont toujours là tant que la page reste ouverte. Réessayez dans un instant.",
    suiteTechnique: "L'envoi n'a pas abouti. Réessayez dans un instant.",
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
      "Le cœur de la consultation. Choisissez les 5 mesures qui comptent le plus pour vous, puis classez les.",
    aide: "Touchez une mesure pour l'ajouter à votre classement. Vous pourrez ensuite changer l'ordre ou la retirer.",
    ordre: "Les mesures sont présentées dans un ordre tiré au hasard pour chaque personne.",
    titreClassement: (n: number, total: number) => `Mon classement (${n} sur ${total})`,
    titreListe: "Les 24 mesures",
    chargement: "Préparation de la liste des mesures…",
    vide: "Votre classement apparaîtra ici.",
    complet: "Vos 5 priorités sont prêtes. L'ordre reste modifiable.",
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
  ideesIntro: "Tout est facultatif. Une idée manque ? Elle peut rejoindre la synthèse.",
  recapIntro: "Relisez avant d'envoyer. Tout reste modifiable.",
  valider: "J'envoie mes réponses",
  suivant: "Continuer",
  retour: "Retour",
  envoi: "Envoi en cours…",
  close:
    "La consultation est close. Merci à toutes les personnes qui ont répondu. La synthèse sera remise en février 2027.",
  /** Titre de l'écran de fin. */
  merci: "Merci. Votre voix est enregistrée.",
  /** Écran de fin, affiché uniquement après la confirmation du serveur. */
  fin: {
    /** Phrase sous le titre (à afficher par le prompt 4). */
    confirmation: "Elle rejoint la synthèse remise aux candidates et candidats en février 2027.",
    vosPriorites: "Vos 5 priorités",
    rang: (n: number) => `Vous êtes la ${n.toLocaleString("fr-FR")}e personne à répondre.`,
    ensuiteTitre: "Et maintenant",
    ensuite: [
      `La consultation reste ouverte jusqu'au ${DATE_FIN_CONSULTATION}.`,
      `L'Institut Rousseau et Face à l'inceste rassemblent ensuite toutes les réponses. La synthèse est présentée lors du débat organisé par l'Institut Rousseau en ${DEBAT}.`,
    ],
    /** Affiché seulement si DATE_RESULTATS est renseignée dans config.ts. */
    resultats: DATE_RESULTATS
      ? `Les résultats seront publiés le ${formaterJour(DATE_RESULTATS, true)}.`
      : "",
    methode: "Comment les réponses sont analysées",
  },
  rebondTitre: "Envie d'aller plus loin ? Rejoignez un atelier en décembre.",
  /** Phrase sous le titre du rebond (à afficher par le prompt 4). */
  rebondTexte: "1h30 en visio et en petit groupe. Aucune expertise requise.",
  rebondBouton: "Je choisis mon atelier",
  dejaRepondu: {
    titre: "Merci pour votre participation",
    texte:
      "Une réponse a déjà été envoyée depuis ce navigateur. La consultation accepte une seule réponse par personne.",
  },
  suite: {
    titre: "Connaître la suite",
    texte: `Laissez votre email pour recevoir la synthèse ${RESTITUTION} et l'invitation au débat.`,
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
    "Un atelier réunit en visio jusqu'à 30 personnes (parents, citoyennes et citoyens, professionnelles et professionnels, militantes et militants).",
    "Les priorités issues de la consultation servent de point de départ.",
    "Pendant 1h30, nous partons de ce que vous vivez, voyez ou étudiez pour construire des propositions concrètes.",
    "Elles rejoignent la synthèse remise aux candidates et candidats en février 2027.",
  ],
  ouvertes: `Inscriptions ouvertes jusqu'au ${DATE_LIMITE_INSCRIPTION}.`,
  closes: "Les inscriptions aux ateliers sont closes. Merci pour votre intérêt.",
  boutonConsultation: "Je choisis mes 5 priorités",
  placesRestantes: (n: number) => (n === 1 ? "1 place restante" : `${n} places restantes`),
  complet: "Complet (liste d'attente)",
  concerne:
    "Les personnes concernées sont les bienvenues. Vous n'avez rien à en dire ici. Vous pourrez en parler pendant l'atelier si vous le souhaitez.",
  bouton: "Je m'inscris",
  envoi: "Inscription en cours…",
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
  texte: (n: number) => `Plus de ${n.toLocaleString("fr-FR")} personnes ont déjà répondu.`,
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
        "Vous pouvez aussi proposer une mesure qui manque. Chaque proposition est lue.",
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
        "Le classement en cours n'est jamais affiché pendant la consultation. Il pourrait influencer les réponses.",
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
  titre: "Invitez une personne de plus",
  texte: "Chaque voix rend la synthèse plus représentative.",
  /** Message prérempli : jamais « j'ai répondu ». */
  message: `Présidentielle 2027. Une consultation anonyme pour choisir les mesures qui protègeront les enfants. Environ ${DUREE_CONSULTATION_MINUTES} minutes.`,
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
        "La consultation est anonyme. Nous n'enregistrons ni nom, ni email, ni adresse IP, ni l'heure de réponse, seulement le jour. Les réponses servent à préparer une synthèse remise aux candidates et candidats.",
        "L'inscription aux ateliers demande vos coordonnées pour organiser l'atelier et vous envoyer le lien de la visio.",
        "Si vous l'avez accepté, votre email sert aussi à vous envoyer les actualités de l'Institut Rousseau ou de Face à l'inceste (selon les cases cochées).",
        "Après la consultation, vous pouvez laisser votre email pour connaître la suite (synthèse et débat). Il est enregistré dans une liste à part et n'est jamais relié à vos réponses. Il sert uniquement à vous écrire pour la restitution.",
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
