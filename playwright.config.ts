import { defineConfig, devices } from "@playwright/test";

/**
 * Trois serveurs locaux, chacun avec sa propre base PGlite neuve :
 * 3200 à la date réelle, 3201 au lendemain du jour J moins 3 à 0 h 00, 3202 après la clôture de la consultation.
 */
const env = (port: number, extra: Record<string, string> = {}) => ({
  DATABASE_DRIVER: "pglite",
  PGLITE_DIR: `.data/e2e-${port}`,
  ADMIN_USERNAME: "organisatrice",
  ADMIN_PASSWORD: "e2e-mot-de-passe",
  ADMIN_SESSION_SECRET: "cle-e2e-uniquement-0123456789abcdefghij",
  IP_HASH_SALT: "sel-e2e-0123456789",
  ...extra,
});
const serveur = (port: number, extra: Record<string, string> = {}) => ({
  command: `rm -rf .data/e2e-${port} && npx vite dev --port ${port} --strictPort`,
  url: `http://localhost:${port}/`,
  env: env(port, extra),
  timeout: 240_000,
  reuseExistingServer: false,
});

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3200",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } } },
    {
      name: "ordinateur-1280",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: [
    serveur(3200),
    serveur(3201, { DATE_SIMULEE: "2026-12-12T00:00:00+01:00" }),
    serveur(3202, { DATE_SIMULEE: "2027-02-01T00:00:00+01:00" }),
  ],
});
