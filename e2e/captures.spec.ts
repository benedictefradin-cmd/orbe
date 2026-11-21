import { test } from "@playwright/test";
import { pagePrete, parcoursConsultation, remplirProfil } from "./aides";

/** Captures des pages principales, en mobile (360 px) et ordinateur (1280 px), dans docs/captures. */
test.describe("captures", () => {
  test("pages principales", async ({ page }, info) => {
    const format = info.project.name === "mobile-360" ? "mobile" : "ordinateur";
    const capture = (nom: string) =>
      page.screenshot({
        path: `docs/captures/${nom}-${format}.png`,
        fullPage: true,
        animations: "disabled",
      });
    for (const [nom, chemin] of [
      ["accueil", "/"],
      ["ateliers", "/ateliers"],
      ["donnees-personnelles", "/donnees-personnelles"],
    ] as const) {
      await page.goto(chemin);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await capture(nom);
    }
    await page.goto("/consultation");
    await pagePrete(page, "Continuer");
    await capture("consultation-1-profil");
    await remplirProfil(page);
    await page.getByRole("button", { name: "Continuer" }).click();
    const mesures = page.locator("button.mesure");
    for (let i = 0; i < 3; i++) await mesures.nth(i * 4).click();
    await capture("consultation-2-priorites");
    await parcoursConsultation(page);
    await capture("consultation-confirmation");
    await page.goto("/admin");
    await page.getByLabel("Identifiant").fill("organisatrice");
    await page.getByLabel("Mot de passe").fill("e2e-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByRole("heading", { name: "Tableau de bord" }).waitFor();
    await page.waitForTimeout(1200);
    await capture("admin-ateliers");
    await page.getByRole("tab", { name: "Consultation" }).click();
    await page.waitForTimeout(1200);
    await capture("admin-consultation");
  });
});
