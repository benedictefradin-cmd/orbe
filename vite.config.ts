// Build autonome, sans Lovable. Nitro choisit la cible d'hébergement au moment du build
// (Vercel, Netlify, Node… détectés automatiquement, ou NITRO_PRESET).
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ server: { entry: "server" } }),
    nitro({
      // Tâche quotidienne Vercel : sollicite la base pour que Supabase ne mette pas le projet gratuit en pause.
      vercel: { config: { version: 3, crons: [{ path: "/api/maintien", schedule: "0 5 * * *" }] } },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
