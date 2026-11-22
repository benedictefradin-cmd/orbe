import { test } from "@playwright/test";
import { allerAuProfil, choisirMesures, pagePrete, parcoursConsultation } from "./aides";

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
    await choisirMesures(page, 3);
    await capture("consultation-1-priorites");
    await page.reload();
    await pagePrete(page, "Continuer");
    await allerAuProfil(page);
    await capture("consultation-3-profil");
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
