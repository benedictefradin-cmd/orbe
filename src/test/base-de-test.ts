import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { preparerPglite, rpcDepuisPglite, utiliserRpc } from "@/lib/server/db.server";

const dossier = path.resolve(__dirname, "../../supabase/migrations");
export const migrations = readdirSync(dossier)
  .filter((f) => f.endsWith(".sql") && !f.includes("planifiees"))
  .sort()
  .map((f) => readFileSync(path.join(dossier, f), "utf8"));

/** Base Postgres en mémoire, avec les vraies migrations, branchée sur la couche d'accès. */
export async function nouvelleBase(liste: string[] = migrations) {
  const db = new PGlite();
  await preparerPglite(db, liste);
  utiliserRpc(rpcDepuisPglite(db));
  return db;
}
