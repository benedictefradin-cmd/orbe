// Captures des pages publiques à plusieurs largeurs, pour comparer les lots de la refonte.
// Usage : npm run captures -- <nom-du-lot>     (écrit dans captures/<nom-du-lot>/)
// Serveur : BASE_URL si fourni, sinon un serveur local PGlite est lancé sur le port 3300.
// Seules les requêtes GET passent : aucun envoi de formulaire, aucune écriture en base.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const lot = process.argv[2];
if (!lot || !/^[\w.-]+$/.test(lot)) {
  console.error("Indiquez un nom de lot : npm run captures -- 01-fondations");
  process.exit(1);
}

const PAGES = [
  { nom: "accueil", chemin: "/" },
  { nom: "contexte", chemin: "/contexte" },
  { nom: "consultation", chemin: "/consultation" },
  { nom: "ateliers", chemin: "/ateliers" },
  { nom: "donnees-personnelles", chemin: "/donnees-personnelles" },
];
const LARGEURS = [
  { largeur: 360, hauteur: 780 },
  { largeur: 390, hauteur: 844 },
  { largeur: 834, hauteur: 1194 },
  { largeur: 1440, hauteur: 900 },
  { largeur: 1920, hauteur: 1080 },
];

const PORT = 3300;
const base = process.env.BASE_URL ?? `http://localhost:${PORT}`;
let serveur;

async function joignable(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function demarrerServeur() {
  if (await joignable(base)) return;
  if (process.env.BASE_URL) throw new Error(`${base} ne répond pas`);
  const dossier = path.join(racine, ".data/captures");
  await rm(dossier, { recursive: true, force: true });
  serveur = spawn("npx", ["vite", "dev", "--port", String(PORT), "--strictPort"], {
    cwd: racine,
    stdio: "ignore",
    env: {
      ...process.env,
      DATABASE_DRIVER: "pglite",
      PGLITE_DIR: ".data/captures",
      ADMIN_USERNAME: "captures",
      ADMIN_PASSWORD: "captures-mot-de-passe",
      ADMIN_SESSION_SECRET: "cle-captures-uniquement-0123456789abcdef",
      IP_HASH_SALT: "sel-captures-0123456789",
    },
  });
  const limite = Date.now() + 240_000;
  while (Date.now() < limite) {
    if (await joignable(base)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Le serveur local n'a pas démarré");
}

/** Défilement lent jusqu'en bas, pour déclencher les animations liées au défilement. */
async function defiler(page) {
  await page.evaluate(async () => {
    const pas = Math.round(window.innerHeight / 3);
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
  });
}

const dossierLot = path.join(racine, "captures", lot);
await mkdir(dossierLot, { recursive: true });

const tiers = new Set();
const lignes = [];
try {
  await demarrerServeur();
  const origine = new URL(base).host;
  const navigateur = await chromium.launch();

  for (const { largeur, hauteur } of LARGEURS) {
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: hauteur },
      locale: "fr-FR",
      timezoneId: "Europe/Paris",
    });
    await contexte.route("**/*", (route) => {
      const requete = route.request();
      const hote = new URL(requete.url()).host;
      if (hote && hote !== origine) tiers.add(hote);
      return requete.method() === "GET" ? route.continue() : route.abort();
    });
    const page = await contexte.newPage();

    for (const { nom, chemin } of PAGES) {
      await page.goto(base + chemin, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Laisse finir les animations d'entrée, qui ne dépendent pas du défilement.
      await page.waitForTimeout(1500);

      const mesures = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        const transparents = [...document.body.querySelectorAll("*")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 0.5,
        );
        return {
          ecrans: document.documentElement.scrollHeight / window.innerHeight,
          h1: h1 ? getComputedStyle(h1).fontSize : "absent",
          transparents: transparents.length,
        };
      });

      const fichier = `${nom}-${largeur}`;
      await page.screenshot({ path: path.join(dossierLot, `${fichier}-fold.png`) });
      await defiler(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(dossierLot, `${fichier}-complet.png`),
        fullPage: true,
      });

      lignes.push({
        page: chemin,
        largeur,
        écrans: mesures.ecrans.toFixed(1),
        h1: mesures.h1,
        "opacité < 0,5": mesures.transparents,
      });
    }
    await contexte.close();
  }
  await navigateur.close();
} finally {
  serveur?.kill();
}

console.table(lignes);
console.log(
  tiers.size
    ? `Requêtes vers des domaines tiers : ${[...tiers].join(", ")}`
    : "Aucune requête vers un domaine tiers",
);
console.log(`Captures écrites dans captures/${lot}/`);
