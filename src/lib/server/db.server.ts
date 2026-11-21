/**
 * Accès aux données, côté serveur uniquement.
 * Toutes les opérations passent par des fonctions SQL (voir supabase/migrations).
 * Production : Supabase, avec la clé service_role.
 * Développement local et tests : PGlite, un vrai Postgres embarqué, avec les mêmes migrations
 * (DATABASE_DRIVER=pglite). Jamais de succès simulé, jamais de stockage dans le navigateur.
 */
type Rpc = (fonction: string, args: Record<string, unknown>) => Promise<unknown>;

let rpcCourant: Promise<Rpc> | undefined;

export function utiliserRpc(rpc: Rpc | undefined) {
  rpcCourant = rpc ? Promise.resolve(rpc) : undefined;
}

export async function rpc<T>(fonction: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!rpcCourant) {
    // Une seule initialisation, même si plusieurs requêtes arrivent en même temps.
    rpcCourant =
      process.env["DATABASE_DRIVER"] === "pglite" ? rpcPglite() : Promise.resolve(rpcSupabase());
    rpcCourant.catch(() => {
      rpcCourant = undefined;
    });
  }
  return (await (
    await rpcCourant
  )(fonction, args)) as T;
}

function rpcSupabase(): Rpc {
  const url = process.env["SUPABASE_URL"];
  const cle = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !cle)
    throw new Error("Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.");
  let client:
    | Promise<{
        rpc: (
          f: string,
          a: Record<string, unknown>,
        ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
      }>
    | undefined;
  return async (fonction, args) => {
    client ??= import("@supabase/supabase-js").then(
      ({ createClient }) =>
        createClient(url, cle, {
          auth: { persistSession: false, autoRefreshToken: false },
        }) as never,
    );
    const { data, error } = await (await client).rpc(fonction, args);
    if (error) throw new Error(`Base de données, ${fonction}, ${error.message}`);
    return data;
  };
}

/** Appel nommé d'une fonction SQL : select f(a => $1, b => $2). */
export function requetePourRpc(fonction: string, args: Record<string, unknown>) {
  if (!/^[a-z_]+$/.test(fonction)) throw new Error("Nom de fonction invalide");
  const cles = Object.keys(args);
  for (const c of cles) if (!/^_?[a-z_]+$/.test(c)) throw new Error("Nom de paramètre invalide");
  const valeurs = cles.map((c) => {
    const v = args[c];
    return v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v;
  });
  return {
    sql: `select public.${fonction}(${cles.map((c, i) => `${c} => $${i + 1}`).join(", ")}) as resultat`,
    valeurs,
  };
}

type Pglite = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
  exec: (sql: string) => Promise<unknown>;
};

export function rpcDepuisPglite(db: Pglite): Rpc {
  return async (fonction, args) => {
    const { sql, valeurs } = requetePourRpc(fonction, args);
    const { rows } = await db.query(sql, valeurs);
    return rows[0]?.["resultat"] ?? null;
  };
}

/** Prépare une base PGlite avec les migrations du dépôt (sans pg_cron, absent de PGlite). */
export async function preparerPglite(db: Pglite, migrations: string[]) {
  await db.exec(`do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  end $$;`);
  const deja = await db.query("select to_regclass('public.ateliers') as t");
  if (deja.rows[0]?.["t"]) return;
  for (const sql of migrations) await db.exec(sql);
}

async function rpcPglite(): Promise<Rpc> {
  // Import indirect : PGlite n'est jamais embarqué dans le build de production.
  const nomModule = "@electric-sql/pglite";
  const { PGlite } = (await import(/* @vite-ignore */ nomModule)) as {
    PGlite: new (dir?: string) => Pglite;
  };
  const { mkdir, readFile, readdir } = await import("node:fs/promises");
  const dossier = "supabase/migrations";
  const fichiers = (await readdir(dossier))
    .filter((f) => f.endsWith(".sql") && !f.includes("planifiees"))
    .sort();
  const migrations = await Promise.all(fichiers.map((f) => readFile(`${dossier}/${f}`, "utf8")));
  const repertoire = process.env["PGLITE_DIR"] ?? ".data/pglite";
  await mkdir(repertoire, { recursive: true });
  const db = new PGlite(repertoire);
  await preparerPglite(db, migrations);
  return rpcDepuisPglite(db);
}
