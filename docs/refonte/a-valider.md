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
