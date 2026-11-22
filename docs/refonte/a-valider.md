# À valider par les structures porteuses

Informations manquantes ou choix qui ne relèvent pas du développement. Tant qu'un point n'est pas validé, le site affiche un repli neutre. Chaque point indique où se trouve la valeur à remplacer.

## Lot A · Neutralité du questionnaire

### A1. Sources des mesures

Fichier : `src/lib/mesures.ts` (`ORGANISMES`).

- [ ] **Intitulé exact de la commission de l'Assemblée nationale.** Le tableur source dit seulement « Commission AN ». Le site affiche « Commission de l'Assemblée nationale » en attendant. Merci d'indiquer l'intitulé exact et la date du rapport.
- [ ] **Nom du document de Face à l'inceste.** Le tableur dit « FAI (1) ». Le site affiche « Proposition 1 de Face à l'inceste ». Merci d'indiquer le titre et la date du document (plaidoyer, livre blanc…).
- [ ] **Nature des numéros.** Pour la CIIVISE, le site parle de « préconisations » (terme repris de la page contexte, rapport de novembre 2023). Pour Face à l'inceste et la commission, il parle de « propositions » par défaut. À corriger s'il s'agit de « recommandations ».

### A2. Détails des mesures (champ `detail`)

Fichier : `src/lib/mesures.ts`. Les 24 champs `detail` sont vides. Le bouton « Détails » n'apparaît que pour une mesure dont le détail est rempli. Notions à expliquer en priorité, en une ou deux phrases neutres (sans argument pour ou contre) :

- [ ] **Ordonnance de sûreté de l'enfant** (m06)
- [ ] **« Syndrome d'aliénation parentale »** (m11)
- [ ] **Pôles spécialisés dans les violences intrafamiliales** (m18)
- [ ] **Confrontation** entre la victime et l'agresseur (m15)
- [ ] **Classement sans suite** (m16)
- [ ] À envisager ensuite : cour d'assises et cour criminelle (m04), office des mineurs (m17), CIIVISE (m23).

Un texte de détail ne doit pas changer le sens de la mesure. Il est le même pour toutes les personnes qui répondent.

### A3. Mesures à double objet

Huit mesures contiennent deux ou trois propositions. Une personne qui soutient une partie seulement ne peut pas l'exprimer, et l'analyse ne peut pas savoir quelle partie a été retenue. Elles ne sont **pas modifiées** : leur formulation est un choix politique des structures porteuses.

Si vous décidez de les scinder, les anciennes formulations restent en base sous leur identifiant (m02, m04…) pour les réponses déjà reçues. Les nouvelles formulations prennent **de nouveaux identifiants à partir de m25**, et le questionnaire passe en version v3 (`VERSION_QUESTIONNAIRE` dans `src/lib/config.ts`). Scinder change le nombre de mesures (plus de 24) : les textes « 24 mesures » seront à mettre à jour. Les sources de chaque nouvelle mesure sont à répartir par vos soins.

Propositions de reformulation à un seul objet :

| Actuelle | Proposition |
|---|---|
| **m02** Élargir la notion de violences sexuelles intrafamiliales aux cousins germains, aux personnes majeures victimes de faits commis pendant leur minorité, et aux enfants des conjoints ou concubins. | **m25** Inclure les cousins germains dans la définition des violences sexuelles intrafamiliales.<br>**m26** Inclure les enfants des conjoints ou concubins dans la définition des violences sexuelles intrafamiliales.<br>**m27** Étendre la notion de violences sexuelles intrafamiliales aux personnes majeures victimes de faits commis pendant leur minorité. |
| **m04** Reconnaître les troubles psychotraumatiques comme preuve médico légale à part entière, et juger systématiquement les viols sur mineurs devant la cour d'assises. | **m28** Reconnaître les troubles psychotraumatiques comme preuve médico légale à part entière.<br>**m29** Juger systématiquement les viols sur mineurs devant la cour d'assises. |
| **m11** Garantir la sécurité du parent protecteur et bannir le « syndrome d'aliénation parentale » des débats judiciaires. | **m30** Garantir la sécurité du parent protecteur.<br>**m31** Bannir le « syndrome d'aliénation parentale » des débats judiciaires. |
| **m17** Renforcer les moyens de l'office des mineurs et de la lutte contre la cyberpédocriminalité, et nommer un procureur spécialisé dans la protection de l'enfance dans chaque tribunal. | **m32** Renforcer les moyens de l'office des mineurs et de la lutte contre la cyberpédocriminalité.<br>**m33** Nommer un procureur spécialisé dans la protection de l'enfance dans chaque tribunal. |
| **m18** Confier les violences sexuelles intrafamiliales sur enfants aux pôles spécialisés dans les violences intrafamiliales, et juger ensemble les volets civil et pénal. | **m34** Confier les violences sexuelles intrafamiliales sur enfants aux pôles spécialisés dans les violences intrafamiliales.<br>**m35** Juger ensemble les volets civil et pénal des violences sexuelles intrafamiliales sur enfants. |
| **m20** Mettre en œuvre à l'école l'éducation à la vie affective et sexuelle, et un entretien individuel annuel obligatoire pour repérer les violences. | **m36** Mettre en œuvre à l'école l'éducation à la vie affective et sexuelle.<br>**m37** Instaurer à l'école un entretien individuel annuel obligatoire pour repérer les violences. |
| **m22** Former tous les professionnels au contact d'enfants au repérage systématique des violences, et protéger de toute sanction les personnes qui signalent. | **m38** Former tous les professionnels au contact d'enfants au repérage systématique des violences.<br>**m39** Protéger de toute sanction les personnes qui signalent des violences sur un enfant. |
| **m23** Garantir des soins spécialisés en psychotraumatisme pris en charge à 100 %, une juste réparation des préjudices, et pérenniser la CIIVISE. | **m40** Garantir des soins spécialisés en psychotraumatisme pris en charge à 100 %.<br>**m41** Garantir une juste réparation des préjudices subis.<br>**m42** Pérenniser la CIIVISE. |

Pour m17, l'office des mineurs et la cyberpédocriminalité peuvent aussi être séparés (deux mesures de moyens).

## Lot B · Parcours et données sensibles

### B1. Libellés « Votre lien avec le sujet » (à faire valider par Face à l'inceste)

Fichier : `src/lib/formulaires.ts` (`Q.lienSujet`, `Q.consentementConcerne`). Libellés provisoires :

- [ ] « Je suis une personne concernée (violences sexuelles subies dans l'enfance) »
- [ ] « Je connais une personne qui a subi des violences sexuelles dans son enfance »
- [ ] Case d'accord, qui n'apparaît que si la première réponse est cochée : « J'accepte que cette information, anonyme, soit utilisée pour les statistiques de la synthèse »
- [ ] Message si la case n'est pas cochée : « Pour que cette réponse soit comptée, cochez la case d'accord. Vous pouvez aussi décocher « personne concernée ». Les deux choix sont possibles. » Sans accord, rien n'est enregistré (vérifié côté navigateur et côté serveur).

### B2. Réponses v1 « personnellement concerné »

- [ ] Les réponses v1 (avant le 23 novembre 2026) ont pu cocher « Je suis personnellement concerné » **sans case d'accord explicite**. Elles sont conservées telles quelles. À décider : les compter ou non dans les statistiques « personnes concernées » de la synthèse. Le tableau de bord permet de filtrer par version.

### B3. Âge minimum et mineurs de 15 à 17 ans (vérification juridique)

À faire vérifier par la personne en charge des données à l'Institut Rousseau :

- [ ] **Base légale du traitement pour les 15 à 17 ans.** L'article 8 du règlement (UE) 2016/679 (RGPD) et l'article 45 de la loi n° 78‑17 du 6 janvier 1978 fixent en France à 15 ans l'âge à partir duquel une personne mineure peut consentir seule à un traitement de ses données dans le cadre des services de la société de l'information. Vérifier que cela couvre la consultation, en particulier la réponse « personne concernée » (donnée sensible, article 9 du RGPD).
- [ ] **Moins de 15 ans.** Le site affiche un message bienveillant avec le 119 et n'enregistre rien (vérifié côté serveur). Texte dans `CONSULTATION.moins15` (`src/lib/contenus.ts`), à relire.
- [ ] La mention « Ouvert à partir de 15 ans » s'affiche dans l'introduction de la consultation.

## Lot C · Redevabilité

### C1. Textes provisoires

- [ ] **Page `/methode`** (`METHODE` dans `src/lib/contenus.ts`). En particulier : qui a choisi les 24 mesures (le site dit « l'Institut Rousseau et l'association Face à l'inceste »), la relecture des textes libres avant citation (qui relit, et selon quelle règle), le traitement des réponses identiques.
- [ ] **Écran de fin** (`CONSULTATION.fin`). Le site dit que la synthèse sera présentée aux candidates et candidats lors du débat organisé par l'Institut Rousseau en février 2027 (repris de la page contexte).
- [ ] **Date de publication des résultats.** `DATE_RESULTATS` est vide dans `src/lib/config.ts`. Rien ne s'affiche tant qu'elle n'est pas renseignée.
- [ ] **Page `/resultats`.** Fermée (404) tant que `RESULTATS_PUBLICS = false`. À ouvrir seulement après la clôture, pour ne pas influencer les réponses.
- [ ] **Compteur.** `COMPTEUR_ACTIF = true`, seuil de 100 réponses, arrondi à la dizaine inférieure. Le rang personnel (« Vous êtes la 342e personne à répondre ») suit le même réglage.

### C2. Page données personnelles (ajouts à valider)

Fichier : `DONNEES` dans `src/lib/contenus.ts`.

- [ ] **Base légale.** Texte provisoire : le traitement repose sur le consentement. La réponse « personne concernée » repose sur un accord explicite (case à cocher), puisqu'il s'agit d'une donnée sensible (article 9 du RGPD). À confirmer par la personne en charge des données.
- [ ] **Durée de conservation des réponses anonymes.** `SUPPRESSION_DES_REPONSES` est vide dans `src/lib/config.ts`. En attendant, le site dit que la date sera indiquée dès qu'elle sera fixée. Proposition à arbitrer : une date après la remise de la synthèse (par exemple fin 2027).
- [ ] **Réponse « personne concernée ».** Nouveau paragraphe : facultative, enregistrée seulement avec l'accord, jamais publiée pour un groupe de moins de 10 personnes.
- [ ] **Impossible de retrouver une réponse.** Paragraphe renforcé dans « Vos droits » : une réponse ne peut être ni retrouvée, ni modifiée, ni supprimée, car rien ne la relie à la personne.

## Lot D · Fiabilité et analyse

- [ ] **Quota relevé à 30 envois par heure et par connexion** (`ENVOIS_MAX_PAR_HEURE`), pour ne pas bloquer un lycée ou une association qui répond depuis la même connexion. La connexion au tableau de bord reste limitée à 10 tentatives par heure.
- [ ] **Réponses strictement identiques.** Elles sont repérées (tout le contenu identique, jour excepté) et le tableau de bord montre le classement avec et sans elles. Depuis la v2, l'ordre d'affichage tiré au hasard fait partie du contenu : deux personnes différentes n'ont pratiquement jamais le même. À décider : quelle version retenir pour la synthèse.
- [ ] **Masquage dans le tableau de bord.** Les effectifs de 1 à 9 réponses sont masqués, y compris pour l'organisatrice (les exports restent complets). À confirmer.

## Prompt 3 · Textes

### T1. Source du chiffre « 77 % »

Fichier : `src/lib/contenus.ts` (`CHIFFRES[1]`).

- [ ] **Source exacte introuvable.** Le site affiche « 77 % de ces violences ont lieu au sein de la famille » avec la mention « Source estimation CIIVISE reprise par le plan gouvernemental de lutte contre les violences faites aux enfants 2023 2027 ». Merci d'indiquer le document et la page exacts. S'il n'y en a pas, retirer le chiffre. La valeur n'a pas été modifiée.

### T2. Réécritures à relire

- [ ] **Frise du contexte.** Une phrase par date. Le 28 octobre 2026 ne mentionne plus que la commission des lois du Sénat avait écarté l'imprescriptibilité. La formulation vient du prompt 3.
- [ ] **Sondage Ipsos 2025.** « des Français » devient « des personnes interrogées ». Vérifier que cela correspond bien à l'échantillon du sondage.

## Points de vigilance pour la mise en production

- Appliquer les nouvelles migrations sur Supabase, dans l'ordre : `20261122000000_contacts_suite.sql` (prompt 1), `20261123000000_consultation_v2.sql`, `20261123000100_compteur_reponses.sql`, `20261123000200_jetons_usage_unique.sql`. Elles sont rejouables. Le fichier `docs/schema-a-appliquer.sql` les contient toutes.
- **Réponses déjà reçues.** Impossible de le vérifier depuis le poste de développement (aucune clé Supabase en local). La migration v2 ne modifie ni ne supprime aucune ligne : elle ajoute des colonnes et marque toute réponse existante en `v1`. Un test le vérifie (`src/test/sql.test.ts`). Pour contrôler après déploiement, dans l'éditeur SQL : `select version_questionnaire, count(*) from reponses_consultation group by 1;`
