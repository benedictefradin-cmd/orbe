import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Les tests de base de données démarrent un vrai Postgres embarqué (PGlite).
    testTimeout: 60_000,
    hookTimeout: 60_000,
    maxWorkers: 4,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
