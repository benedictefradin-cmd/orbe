/**
 * Les 24 mesures soumises au classement, reprises de l'onglet « Synthèse mesures »
 * du tableur partagé par Face à l'inceste et l'Institut Rousseau.
 * Retouches de forme uniquement (ponctuation, sigles développés) pour respecter
 * les règles d'écriture du site. Les identifiants ne doivent jamais changer :
 * ils sont stockés dans les réponses.
 */

export type Mesure = { id: string; axe: string; texte: string; sources: string };

export const MESURES: readonly Mesure[] = [
  {
    id: "m01",
    axe: "Droit pénal",
    texte:
      "Créer dans le Code pénal une infraction autonome pour les violences sexuelles commises sur un enfant au sein de sa famille, punissant tous ces actes commis sur des mineurs.",
    sources: "FAI (1), CIIVISE (20), Commission AN (6)",
  },
  {
    id: "m02",
    axe: "Droit pénal",
    texte:
      "Élargir la notion de violences sexuelles intrafamiliales aux cousins germains, aux personnes majeures victimes de faits commis pendant leur minorité, et aux enfants des conjoints ou concubins.",
    sources: "Commission AN (6), CIIVISE (22, 23)",
  },
  {
    id: "m03",
    axe: "Droit pénal",
    texte: "Rendre imprescriptibles les viols et agressions sexuelles commis contre des enfants.",
    sources: "FAI (2), CIIVISE (60), Commission AN (5)",
  },
  {
    id: "m04",
    axe: "Droit pénal",
    texte:
      "Reconnaître les troubles psychotraumatiques comme preuve médico légale à part entière, et juger systématiquement les viols sur mineurs devant la cour d'assises.",
    sources: "Commission AN (9), FAI (3)",
  },
  {
    id: "m05",
    axe: "Droit pénal",
    texte:
      "Interdire toute activité au contact d'enfants aux personnes condamnées pour violences sexuelles, y compris bénévole, associative ou privée.",
    sources: "CIIVISE (75), FAI (9)",
  },
  {
    id: "m06",
    axe: "Protection immédiate",
    texte:
      "Créer une ordonnance de sûreté de l'enfant, pour que le juge statue en urgence sur l'autorité parentale dès les révélations.",
    sources: "CIIVISE (26), Commission AN (28)",
  },
  {
    id: "m07",
    axe: "Protection immédiate",
    texte:
      "Inscrire dans la loi qu'en cas de révélations, c'est l'auteur présumé qui quitte le domicile familial, et non l'enfant et le parent protecteur.",
    sources: "Commission AN (29)",
  },
  {
    id: "m08",
    axe: "Protection immédiate",
    texte:
      "Suspendre automatiquement l'autorité parentale et les droits de visite du parent poursuivi pour viol ou agression sexuelle sur son enfant.",
    sources: "CIIVISE (52)",
  },
  {
    id: "m09",
    axe: "Protection immédiate",
    texte:
      "Suspendre toute visite, même encadrée, entre l'enfant victime et son agresseur pendant la procédure.",
    sources: "CIIVISE (29), Commission AN (30)",
  },
  {
    id: "m10",
    axe: "Parent protecteur",
    texte:
      "Ne plus poursuivre le parent qui refuse de remettre l'enfant lorsqu'il signale des soupçons de violences sexuelles et qu'une enquête est en cours.",
    sources: "Commission AN (34)",
  },
  {
    id: "m11",
    axe: "Parent protecteur",
    texte:
      "Garantir la sécurité du parent protecteur et bannir le « syndrome d'aliénation parentale » des débats judiciaires.",
    sources: "CIIVISE (25), FAI (17)",
  },
  {
    id: "m12",
    axe: "Parent protecteur",
    texte:
      "Accompagner juridiquement et psychologiquement les parents protecteurs dès le début de la procédure, avec une information complète sur leurs droits.",
    sources: "Commission AN (33), CIIVISE (38)",
  },
  {
    id: "m13",
    axe: "Enquête et procédure",
    texte:
      "Imposer un délai de 3 mois pour les principaux actes d'enquête en cas de violences sexuelles sur mineurs.",
    sources: "Commission AN (11)",
  },
  {
    id: "m14",
    axe: "Enquête et procédure",
    texte:
      "Garantir que chaque audition d'enfant victime soit menée par un enquêteur formé, selon un protocole adapté, dans une salle dédiée aux enfants.",
    sources: "CIIVISE (39, 40), Commission AN (13)",
  },
  {
    id: "m15",
    axe: "Enquête et procédure",
    texte:
      "Interdire les confrontations entre la victime et son agresseur, pendant l'enquête comme à l'audience.",
    sources: "CIIVISE (42, 55), Commission AN (32)",
  },
  {
    id: "m16",
    axe: "Enquête et procédure",
    texte:
      "Abandonner l'expression « classement sans suite », motiver chaque décision et l'expliquer de vive voix à la victime.",
    sources: "CIIVISE (50, 51), Commission AN (21, 22)",
  },
  {
    id: "m17",
    axe: "Justice",
    texte:
      "Renforcer les moyens de l'office des mineurs et de la lutte contre la cyberpédocriminalité, et nommer un procureur spécialisé dans la protection de l'enfance dans chaque tribunal.",
    sources: "CIIVISE (46, 47), Commission AN (35)",
  },
  {
    id: "m18",
    axe: "Justice",
    texte:
      "Confier les violences sexuelles intrafamiliales sur enfants aux pôles spécialisés dans les violences intrafamiliales, et juger ensemble les volets civil et pénal.",
    sources: "Commission AN (39, 40)",
  },
  {
    id: "m19",
    axe: "Prévention et repérage",
    texte:
      "Lancer chaque année une grande campagne nationale de sensibilisation, accessible à toutes et tous, y compris aux personnes en situation de handicap.",
    sources: "FAI (7), CIIVISE (81), Commission AN (3)",
  },
  {
    id: "m20",
    axe: "Prévention et repérage",
    texte:
      "Mettre en œuvre à l'école l'éducation à la vie affective et sexuelle, et un entretien individuel annuel obligatoire pour repérer les violences.",
    sources: "FAI (8), CIIVISE (7, 8, 80)",
  },
  {
    id: "m21",
    axe: "Prévention et repérage",
    texte:
      "Vérifier les antécédents judiciaires lors de tout recrutement au contact d'enfants, puis à intervalles réguliers.",
    sources: "FAI (9, 10), CIIVISE (74, 76)",
  },
  {
    id: "m22",
    axe: "Prévention et repérage",
    texte:
      "Former tous les professionnels au contact d'enfants au repérage systématique des violences, et protéger de toute sanction les personnes qui signalent.",
    sources: "FAI (12, 25), CIIVISE (1, 4, 5, 6, 11, 17), Commission AN (10, 44)",
  },
  {
    id: "m23",
    axe: "Soins et réparation",
    texte:
      "Garantir des soins spécialisés en psychotraumatisme pris en charge à 100 %, une juste réparation des préjudices, et pérenniser la CIIVISE.",
    sources: "FAI (21, 30), CIIVISE (61 à 63, 82), Commission AN (48)",
  },
  {
    id: "m24",
    axe: "Gouvernance",
    texte:
      "Créer un ministère de l'Enfance doté d'un budget dédié, récurrent et évalué, pour piloter la protection des enfants contre les violences, notamment sexuelles et intrafamiliales.",
    sources: "FAI (11), Commission AN (49), CIIVISE (82)",
  },
];

export const MESURE_IDS = MESURES.map((m) => m.id) as [string, ...string[]];

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
