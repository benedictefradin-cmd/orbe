// Génère public/og-image.png (1200 × 630) par capture de scripts/og-image.html avec Playwright.
// Usage : npm run og-image
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(racine, "scripts/og-image.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(racine, "public/og-image.png"), type: "png" });
await navigateur.close();
console.log("public/og-image.png généré");
