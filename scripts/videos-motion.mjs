// Trois courtes vidéos du mouvement, pour relecture humaine : accueil, ajout d'une mesure, validation.
// Usage : npm run videos -- <nom-du-lot>     (écrit dans captures/<nom-du-lot>/)
// Un serveur local PGlite neuf est lancé sur le port 3301 : la validation écrit une réponse de test dans cette base jetable.
// La vidéo de validation contient l'attente anti robots (le serveur refuse un envoi avant 20 secondes).
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const lot = process.argv[2];
if (!lot || !/^[\w.-]+$/.test(lot)) {
  console.error("Indiquez un nom de lot : npm run videos -- 05-motion");
  process.exit(1);
}

const PORT = 3301;
const base = `http://localhost:${PORT}`;
const TAILLE = { width: 1280, height: 800 };
const dossierLot = path.join(racine, "captures", lot);
const brouillon = path.join(dossierLot, ".brut");

async function joignable(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function demarrerServeur() {
  const dossier = path.join(racine, ".data/videos");
  await rm(dossier, { recursive: true, force: true });
  const serveur = spawn("npx", ["vite", "dev", "--port", String(PORT), "--strictPort"], {
    cwd: racine,
    stdio: "ignore",
    env: {
      ...process.env,
      DATABASE_DRIVER: "pglite",
      PGLITE_DIR: ".data/videos",
      ADMIN_USERNAME: "videos",
      ADMIN_PASSWORD: "videos-mot-de-passe",
      ADMIN_SESSION_SECRET: "cle-videos-uniquement-0123456789abcdef",
      IP_HASH_SALT: "sel-videos-0123456789",
    },
  });
  const limite = Date.now() + 240_000;
  while (Date.now() < limite) {
    if (await joignable(base)) return serveur;
    await new Promise((r) => setTimeout(r, 1000));
  }
  serveur.kill();
  throw new Error("Le serveur local n'a pas démarré");
}

/** Enregistre une scène dans son propre contexte, puis range la vidéo sous un nom lisible. */
async function scene(navigateur, nom, jouer) {
  const contexte = await navigateur.newContext({
    viewport: TAILLE,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    reducedMotion: "no-preference",
    recordVideo: { dir: brouillon, size: TAILLE },
  });
  const page = await contexte.newPage();
  await jouer(page);
  const video = page.video();
  await contexte.close();
  if (video) await rename(await video.path(), path.join(dossierLot, `${nom}.webm`));
  console.log(`${nom}.webm`);
}

const pause = (page, ms) => page.waitForTimeout(ms);
const pret = (page, nom) =>
  page.getByRole("button", { name: nom }).and(page.locator(":enabled")).waitFor();

await mkdir(brouillon, { recursive: true });
const serveur = await demarrerServeur();
try {
  // Chauffe : la première compilation de vite ne doit pas figurer dans les vidéos.
  for (const chemin of ["/", "/consultation", "/contexte"]) await fetch(base + chemin);
  const navigateur = await chromium.launch();

  await scene(navigateur, "accueil", async (page) => {
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await pause(page, 2000);
    await page.locator(".sommaire .bouton").hover();
    await pause(page, 900);
    await page.locator('.sommaire a[href="/contexte"]').click();
    await page.waitForURL("**/contexte");
    await pause(page, 1200);
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 260);
      await pause(page, 250);
    }
    await pause(page, 800);
  });

  await scene(navigateur, "ajout-mesure", async (page) => {
    await page.goto(base + "/consultation", { waitUntil: "networkidle" });
    await pret(page, "Continuer");
    await pause(page, 800);
    const mesures = page.locator("button.mesure");
    for (const i of [0, 3, 6]) {
      await mesures.nth(i).scrollIntoViewIfNeeded();
      await mesures.nth(i).click();
      await pause(page, 900);
    }
    await page.locator("#mon-classement").scrollIntoViewIfNeeded();
    await pause(page, 500);
    await page
      .getByRole("button", { name: /^Monter/ })
      .nth(2)
      .click();
    await pause(page, 900);
    await page
      .getByRole("button", { name: /^Descendre/ })
      .first()
      .click();
    await pause(page, 900);
    await page
      .getByRole("button", { name: /^Retirer/ })
      .nth(1)
      .click();
    await pause(page, 1200);
  });

  await scene(navigateur, "validation", async (page) => {
    await page.goto(base + "/consultation", { waitUntil: "networkidle" });
    await pret(page, "Continuer");
    const ouvertLe = Date.now();
    const mesures = page.locator("button.mesure");
    for (let i = 0; i < 5; i++) await mesures.nth(i * 3).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await pause(page, 700);
    await page
      .getByRole("group", { name: /débat public/ })
      .getByLabel("Peu")
      .check();
    await page.getByRole("button", { name: "Continuer" }).click();
    await pause(page, 700);
    const groupe = (nom) => page.getByRole("group", { name: nom });
    await groupe("Votre âge").getByLabel("25 à 34 ans").check();
    await groupe("Vous êtes").getByLabel("Je préfère ne pas répondre").check();
    await page.getByLabel("Votre région").selectOption("idf");
    await groupe("Vous vivez").getByLabel("Dans une commune rurale").check();
    await groupe("Votre situation").getByLabel("En emploi").check();
    await groupe(/parent ou responsable/)
      .getByLabel("Oui")
      .check();
    await groupe(/lien avec l'enfance/)
      .getByLabel("Éducation")
      .check();
    await page.getByRole("button", { name: "Continuer" }).click();
    // Le serveur refuse un envoi fait moins de 20 secondes après l'ouverture du formulaire.
    const reste = 22_000 - (Date.now() - ouvertLe);
    if (reste > 0) await pause(page, reste);
    await page.getByRole("button", { name: "J'envoie mes réponses" }).click();
    await page.getByRole("heading", { name: /Votre voix est enregistrée/ }).waitFor();
    await pause(page, 2500);
  });

  await navigateur.close();
} finally {
  serveur.kill();
  await rm(brouillon, { recursive: true, force: true });
}
console.log(`Vidéos écrites dans captures/${lot}/`);
