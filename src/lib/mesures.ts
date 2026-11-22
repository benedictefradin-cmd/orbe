/**
 * Les 24 mesures soumises au classement, reprises de l'onglet « Synthèse mesures »
 * du tableur partagé par Face à l'inceste et l'Institut Rousseau.
 * Retouches de forme uniquement (ponctuation, sigles développés) pour respecter
 * les règles d'écriture du site. Les identifiants ne doivent jamais changer :
 * ils sont stockés dans les réponses. Toute nouvelle formulation prend un nouvel identifiant (m25 et suivants).
 */

export type Organisme = "ciivise" | "fai" | "an";

/** Une source : un document, et les numéros des préconisations ou propositions reprises. */
export type Source = { organisme: Organisme; numeros: readonly number[]; libelle: string };

export type Mesure = {
  id: string;
  axe: string;
  texte: string;
  sources: readonly Source[];
  /** Explication facultative, affichée derrière un bouton « Détails ». Vide tant qu'elle n'est pas validée. */
  detail?: string;
};

/**
 * Nature et document de chaque source. Le nom exact du document de Face à l'inceste
 * et l'intitulé de la commission de l'Assemblée nationale restent à valider (docs/refonte/a-valider.md).
 */
export const ORGANISMES: Record<Organisme, { un: string; plusieurs: string; libelle: string }> = {
  ciivise: {
    un: "Préconisation",
    plusieurs: "Préconisations",
    libelle: "du rapport de la CIIVISE (novembre 2023)",
  },
  fai: { un: "Proposition", plusieurs: "Propositions", libelle: "de Face à l'inceste" },
  an: {
    un: "Proposition",
    plusieurs: "Propositions",
    libelle: "de la Commission de l'Assemblée nationale",
  },
};

const source =
  (organisme: Organisme) =>
  (...numeros: number[]): Source => ({
    organisme,
    numeros,
    libelle: ORGANISMES[organisme].libelle,
  });
const ciivise = source("ciivise");
const fai = source("fai");
const an = source("an");

/** « 26 et 28 », « 1, 4 à 6, 11 et 17 » : trois numéros qui se suivent ou plus deviennent un intervalle. */
export function formaterNumeros(numeros: readonly number[]): string {
  const tries = [...numeros].sort((a, b) => a - b);
  const blocs: string[] = [];
  for (let i = 0; i < tries.length;) {
    let j = i;
    while (j + 1 < tries.length && tries[j + 1] === tries[j]! + 1) j++;
    if (j - i >= 2) blocs.push(`${tries[i]} à ${tries[j]}`);
    else for (let k = i; k <= j; k++) blocs.push(String(tries[k]));
    i = j + 1;
  }
  return blocs.length > 1
    ? `${blocs.slice(0, -1).join(", ")} et ${blocs.at(-1)}`
    : (blocs[0] ?? "");
}

/** « Préconisations 26 et 28 du rapport de la CIIVISE (novembre 2023) » */
export function formaterSource(s: Source): string {
  const o = ORGANISMES[s.organisme];
  const pluriel = s.numeros.length > 1;
  return `${pluriel ? o.plusieurs : o.un} ${formaterNumeros(s.numeros)} ${s.libelle}`;
}

export const MESURES: readonly Mesure[] = [
  {
    id: "m01",
    axe: "Droit pénal",
    texte:
      "Créer dans le Code pénal une infraction autonome pour les violences sexuelles commises sur un enfant au sein de sa famille, punissant tous ces actes commis sur des mineurs.",
    sources: [fai(1), ciivise(20), an(6)],
  },
  {
    id: "m02",
    axe: "Droit pénal",
    texte:
      "Élargir la notion de violences sexuelles intrafamiliales aux cousins germains, aux personnes majeures victimes de faits commis pendant leur minorité, et aux enfants des conjoints ou concubins.",
    sources: [an(6), ciivise(22, 23)],
  },
  {
    id: "m03",
    axe: "Droit pénal",
    texte: "Rendre imprescriptibles les viols et agressions sexuelles commis contre des enfants.",
    sources: [fai(2), ciivise(60), an(5)],
  },
  {
    id: "m04",
    axe: "Droit pénal",
    texte:
      "Reconnaître les troubles psychotraumatiques comme preuve médico légale à part entière, et juger systématiquement les viols sur mineurs devant la cour d'assises.",
    sources: [an(9), fai(3)],
  },
  {
    id: "m05",
    axe: "Droit pénal",
    texte:
      "Interdire toute activité au contact d'enfants aux personnes condamnées pour violences sexuelles, y compris bénévole, associative ou privée.",
    sources: [ciivise(75), fai(9)],
  },
  {
    id: "m06",
    axe: "Protection immédiate",
    texte:
      "Créer une ordonnance de sûreté de l'enfant, pour que le juge statue en urgence sur l'autorité parentale dès les révélations.",
    sources: [ciivise(26), an(28)],
  },
  {
    id: "m07",
    axe: "Protection immédiate",
    texte:
      "Inscrire dans la loi qu'en cas de révélations, c'est l'auteur présumé qui quitte le domicile familial, et non l'enfant et le parent protecteur.",
    sources: [an(29)],
  },
  {
    id: "m08",
    axe: "Protection immédiate",
    texte:
      "Suspendre automatiquement l'autorité parentale et les droits de visite du parent poursuivi pour viol ou agression sexuelle sur son enfant.",
    sources: [ciivise(52)],
  },
  {
    id: "m09",
    axe: "Protection immédiate",
    texte:
      "Suspendre toute visite, même encadrée, entre l'enfant victime et son agresseur pendant la procédure.",
    sources: [ciivise(29), an(30)],
  },
  {
    id: "m10",
    axe: "Parent protecteur",
    texte:
      "Ne plus poursuivre le parent qui refuse de remettre l'enfant lorsqu'il signale des soupçons de violences sexuelles et qu'une enquête est en cours.",
    sources: [an(34)],
  },
  {
    id: "m11",
    axe: "Parent protecteur",
    texte:
      "Garantir la sécurité du parent protecteur et bannir le « syndrome d'aliénation parentale » des débats judiciaires.",
    sources: [ciivise(25), fai(17)],
  },
  {
    id: "m12",
    axe: "Parent protecteur",
    texte:
      "Accompagner juridiquement et psychologiquement les parents protecteurs dès le début de la procédure, avec une information complète sur leurs droits.",
    sources: [an(33), ciivise(38)],
  },
  {
    id: "m13",
    axe: "Enquête et procédure",
    texte:
      "Imposer un délai de 3 mois pour les principaux actes d'enquête en cas de violences sexuelles sur mineurs.",
    sources: [an(11)],
  },
  {
    id: "m14",
    axe: "Enquête et procédure",
    texte:
      "Garantir que chaque audition d'enfant victime soit menée par un enquêteur formé, selon un protocole adapté, dans une salle dédiée aux enfants.",
    sources: [ciivise(39, 40), an(13)],
  },
  {
    id: "m15",
    axe: "Enquête et procédure",
    texte:
      "Interdire les confrontations entre la victime et son agresseur, pendant l'enquête comme à l'audience.",
    sources: [ciivise(42, 55), an(32)],
  },
  {
    id: "m16",
    axe: "Enquête et procédure",
    texte:
      "Abandonner l'expression « classement sans suite », motiver chaque décision et l'expliquer de vive voix à la victime.",
    sources: [ciivise(50, 51), an(21, 22)],
  },
  {
    id: "m17",
    axe: "Justice",
    texte:
      "Renforcer les moyens de l'office des mineurs et de la lutte contre la cyberpédocriminalité, et nommer un procureur spécialisé dans la protection de l'enfance dans chaque tribunal.",
    sources: [ciivise(46, 47), an(35)],
  },
  {
    id: "m18",
    axe: "Justice",
    texte:
      "Confier les violences sexuelles intrafamiliales sur enfants aux pôles spécialisés dans les violences intrafamiliales, et juger ensemble les volets civil et pénal.",
    sources: [an(39, 40)],
  },
  {
    id: "m19",
    axe: "Prévention et repérage",
    texte:
      "Lancer chaque année une grande campagne nationale de sensibilisation, accessible à toutes et tous, y compris aux personnes en situation de handicap.",
    sources: [fai(7), ciivise(81), an(3)],
  },
  {
    id: "m20",
    axe: "Prévention et repérage",
    texte:
      "Mettre en œuvre à l'école l'éducation à la vie affective et sexuelle, et un entretien individuel annuel obligatoire pour repérer les violences.",
    sources: [fai(8), ciivise(7, 8, 80)],
  },
  {
    id: "m21",
    axe: "Prévention et repérage",
    texte:
      "Vérifier les antécédents judiciaires lors de tout recrutement au contact d'enfants, puis à intervalles réguliers.",
    sources: [fai(9, 10), ciivise(74, 76)],
  },
  {
    id: "m22",
    axe: "Prévention et repérage",
    texte:
      "Former tous les professionnels au contact d'enfants au repérage systématique des violences, et protéger de toute sanction les personnes qui signalent.",
    sources: [fai(12, 25), ciivise(1, 4, 5, 6, 11, 17), an(10, 44)],
  },
  {
    id: "m23",
    axe: "Soins et réparation",
    texte:
      "Garantir des soins spécialisés en psychotraumatisme pris en charge à 100 %, une juste réparation des préjudices, et pérenniser la CIIVISE.",
    sources: [fai(21, 30), ciivise(61, 62, 63, 82), an(48)],
  },
  {
    id: "m24",
    axe: "Gouvernance",
    texte:
      "Créer un ministère de l'Enfance doté d'un budget dédié, récurrent et évalué, pour piloter la protection des enfants contre les violences, notamment sexuelles et intrafamiliales.",
    sources: [fai(11), an(49), ciivise(82)],
  },
];

export const MESURE_IDS = MESURES.map((m) => m.id) as [string, ...string[]];

/** Axes thématiques, par ordre alphabétique : les filtres n'en favorisent aucun. */
export const AXES: readonly string[] = [...new Set(MESURES.map((m) => m.axe))].sort((a, b) =>
  a.localeCompare(b, "fr"),
);

/** Vrai si la liste contient exactement les 24 identifiants, chacun une fois. */
export function estPermutationDesMesures(ids: readonly string[]): boolean {
  return ids.length === MESURES.length && MESURE_IDS.every((id) => ids.includes(id));
}

export function mesureParId(id: string): Mesure | undefined {
  return MESURES.find((m) => m.id === id);
}

/** Ordre de départ mélangé à chaque visite, pour ne pas favoriser les premières mesures. */
export function melanger<T>(liste: readonly T[], aleatoire: () => number = Math.random): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(aleatoire() * (i + 1));
    [copie[i], copie[j]] = [copie[j] as T, copie[i] as T];
  }
  return copie;
}

/**
 * Classement agrégé : points de Borda (1er = N points … Nᵉ = 1 point),
 * rang moyen parmi les personnes qui l'ont retenue, et nombre de fois en tête.
 */
export type LigneClassement = {
  mesure: Mesure;
  points: number;
  selections: number;
  rangMoyen: number | null;
  enTete: number;
};

export function agregerClassement(
  classements: readonly (readonly string[])[],
  n: number,
): LigneClassement[] {
  const stats = new Map(
    MESURES.map((m) => [m.id, { points: 0, selections: 0, sommeRangs: 0, enTete: 0 }]),
  );
  for (const c of classements) {
    c.slice(0, n).forEach((id, i) => {
      const s = stats.get(id);
      if (!s) return;
      s.points += n - i;
      s.selections += 1;
      s.sommeRangs += i + 1;
      if (i === 0) s.enTete += 1;
    });
  }
  return MESURES.map((mesure) => {
    const s = stats.get(mesure.id)!;
    return {
      mesure,
      points: s.points,
      selections: s.selections,
      rangMoyen: s.selections ? s.sommeRangs / s.selections : null,
      enTete: s.enTete,
    };
  }).sort(
    (a, b) => b.points - a.points || b.enTete - a.enTete || a.mesure.id.localeCompare(b.mesure.id),
  );
}
