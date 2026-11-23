// Build autonome, sans Lovable. Nitro choisit la cible d'hébergement au moment du build
// (Vercel, Netlify, Node… détectés automatiquement, ou NITRO_PRESET).
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Serveurs e2e lancés en parallèle : chacun son cache Vite et son dossier Nitro, sinon ils
// se marchent dessus au démarrage (« Vite environment "nitro" is unavailable »).
const dossierServeur = process.env["DOSSIER_SERVEUR"];

export default defineConfig({
  // Les worktrees de .claude/ et les données locales ne font pas partie du site : les surveiller
  // vide le cache et recharge le serveur à chaque écriture d'une autre session.
  server: { port: 3000, watch: { ignored: ["**/.claude/**", "**/.data/**"] } },
  ...(dossierServeur ? { cacheDir: `${dossierServeur}/vite` } : {}),
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({ server: { entry: "server" } }),
    nitro({
      ...(dossierServeur ? { buildDir: `${dossierServeur}/nitro` } : {}),
      // Tâche quotidienne Vercel : sollicite la base pour que Supabase ne mette pas le projet gratuit en pause.
      vercel: { config: { version: 3, crons: [{ path: "/api/maintien", schedule: "0 5 * * *" }] } },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
