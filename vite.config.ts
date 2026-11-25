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

const ENTETES_SECURITE = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy-Report-Only":
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

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
      vercel: {
        config: {
          version: 3,
          // Tâche quotidienne : sollicite la base pour que Supabase ne mette pas le projet gratuit en pause.
          crons: [{ path: "/api/maintien", schedule: "0 5 * * *" }],
          // En têtes de sécurité. La sortie Nitro (.vercel/output/config.json) ignore ceux de
          // vercel.json. continue: true laisse la suite du routage servir la page.
          routes: [{ src: "/(.*)", headers: ENTETES_SECURITE, continue: true }],
        },
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
