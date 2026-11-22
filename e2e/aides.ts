import { expect, type Locator, type Page } from "@playwright/test";

/** Le serveur refuse un envoi fait moins de 20 secondes après l'ouverture du formulaire. */
export async function attendreDelaiMinimum(page: Page, ouvertLe: number) {
  const reste = 22_000 - (Date.now() - ouvertLe);
  if (reste > 0) await page.waitForTimeout(reste);
}

/** Le bouton d'envoi s'active quand la page est interactive. */
export async function pagePrete(page: Page, bouton: string) {
  await expect(page.getByRole("button", { name: bouton })).toBeEnabled();
}

export async function sansDebordement(page: Page) {
  const { large, visible } = await page.evaluate(() => ({
    large: document.documentElement.scrollWidth,
    visible: document.documentElement.clientWidth,
  }));
  expect(large, "débordement horizontal").toBeLessThanOrEqual(visible);
}

/** Appuie sur Tab jusqu'à atteindre l'élément voulu : navigation au clavier uniquement. */
export async function tabJusqua(page: Page, cible: Locator, max = 250) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    if (await cible.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error("Élément jamais atteint au clavier");
}

export const groupe = (page: Page, nom: string | RegExp) => page.getByRole("group", { name: nom });

export async function remplirProfil(page: Page) {
  await groupe(page, "Votre âge").getByLabel("25 à 34 ans").check();
  await groupe(page, "Vous êtes").getByLabel("Je préfère ne pas répondre").check();
  await page.getByLabel("Votre région").selectOption("idf");
  await groupe(page, "Vous vivez").getByLabel("Dans une commune rurale").check();
  await groupe(page, "Votre situation").getByLabel("En emploi").check();
  await groupe(page, /parent ou responsable/)
    .getByLabel("Oui")
    .check();
  await groupe(page, /lien avec l'enfance/)
    .getByLabel("Éducation")
    .check();
}

let adresse = 0;
/** Chaque envoi de test vient d'une adresse différente, pour ne pas buter sur la limite d'envois par heure. */
export async function nouvelleAdresse(page: Page) {
  adresse++;
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.18.${Math.floor(adresse / 250) % 250}.${(adresse % 250) + 1}`,
  });
}

/** Étape 1 du questionnaire v2 : choisit des mesures dans l'ordre tiré pour cette visite. */
export async function choisirMesures(page: Page, n = 5) {
  const mesures = page.locator("button.mesure");
  await expect(mesures).toHaveCount(24);
  for (let i = 0; i < n; i++) await mesures.nth(i * 3).click();
}

/** Va jusqu'à l'étape « Quelques mots sur vous », sans rien remplir de facultatif. */
export async function allerAuProfil(page: Page) {
  await choisirMesures(page);
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: "Vos idées", level: 2 })).toBeFocused();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(
    page.getByRole("heading", { name: "Quelques mots sur vous", level: 2 }),
  ).toBeFocused();
}

export async function parcoursConsultation(page: Page, mesureManquante = "") {
  await nouvelleAdresse(page);
  const debut = Date.now();
  await page.goto("/consultation");
  await pagePrete(page, "Continuer");
  const ouvertLe = Date.now();
  await expect(page.getByText("Cette consultation est anonyme.")).toBeVisible();
  await expect(page.getByText("4 étapes. Environ 7 minutes. Anonyme.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vos priorités", level: 2 })).toBeVisible();
  await choisirMesures(page);
  await expect(page.getByText("Vos 5 priorités sont prêtes.")).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: "Vos idées", level: 2 })).toBeFocused();
  if (mesureManquante)
    await page.getByLabel("Une mesure manque selon vous ?").fill(mesureManquante);
  await groupe(page, /ne soutenez pas/)
    .getByRole("checkbox")
    .first()
    .check();
  await groupe(page, /débat public/)
    .getByLabel("Peu")
    .check();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(
    page.getByRole("heading", { name: "Quelques mots sur vous", level: 2 }),
  ).toBeFocused();
  await remplirProfil(page);
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: "Relecture", level: 2 })).toBeVisible();
  await attendreDelaiMinimum(page, ouvertLe);
  await page.getByRole("button", { name: "J'envoie mes réponses" }).click();
  await expect(
    page.getByRole("heading", { name: "Merci. Votre voix est enregistrée." }),
  ).toBeVisible();
  return Date.now() - debut;
}

let compteur = 0;
export async function inscrire(
  page: Page,
  { ateliers = ["Atelier 1"], email }: { ateliers?: string[]; email?: string } = {},
) {
  await nouvelleAdresse(page);
  await page.goto("/ateliers");
  await pagePrete(page, "Je m'inscris");
  const ouvertLe = Date.now();
  for (const a of ateliers) await page.getByRole("checkbox", { name: new RegExp(a) }).check();
  await page.getByRole("textbox", { name: "Prénom (obligatoire)" }).fill("Camille");
  await page.getByRole("textbox", { name: "Nom (obligatoire)", exact: true }).fill("Test");
  await page
    .getByRole("textbox", { name: /^Email/ })
    .fill(email ?? `camille.${Date.now()}.${compteur++}@exemple.fr`);
  await page.getByLabel("Vous êtes parent").check();
  await page.getByLabel("J'ai 18 ans ou plus").check();
  await page.getByLabel(/J'accepte que l'Institut Rousseau/).check();
  await attendreDelaiMinimum(page, ouvertLe);
  await page.getByRole("button", { name: "Je m'inscris" }).click();
  await expect(
    page.getByRole("heading", { name: "C'est noté. Votre inscription est enregistrée." }),
  ).toBeVisible();
}
