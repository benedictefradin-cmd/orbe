import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/** Accès réservé : uniquement la session signée obtenue avec l'identifiant et le mot de passe secrets. */
async function exigerSession() {
  const { sessionValide } = await import("@/lib/server/admin-session.server");
  if (!(await sessionValide())) throw new Error("Accès refusé");
}

export const getDonneesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { sessionValide } = await import("@/lib/server/admin-session.server");
  if (!(await sessionValide())) return { statut: "anonyme" as const };
  const [{ donneesAdmin }, { maintenant }] = await Promise.all([
    import("@/lib/server/services.server"),
    import("@/lib/server/horloge.server"),
  ]);
  return { statut: "ok" as const, ...(await donneesAdmin(maintenant())) };
});

export const cocherAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        inscription: z.string().uuid(),
        atelier: z.enum(["atelier-1", "atelier-2"]),
        champ: z.enum(["lien_visio", "present", "prevenu"]),
        valeur: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await exigerSession();
    const { rpc } = await import("@/lib/server/db.server");
    return rpc<boolean>("admin_cocher", {
      _inscription: data.inscription,
      _atelier: data.atelier,
      _champ: data.champ,
      _valeur: data.valeur,
    });
  });

export const commenterAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ inscription: z.string().uuid(), texte: z.string().max(1000) }).parse(input),
  )
  .handler(async ({ data }) => {
    await exigerSession();
    const { rpc } = await import("@/lib/server/db.server");
    return rpc<boolean>("admin_commenter", { _inscription: data.inscription, _texte: data.texte });
  });

export const annulerAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        inscription: z.string().uuid(),
        atelier: z.enum(["atelier-1", "atelier-2"]).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await exigerSession();
    const { rpc } = await import("@/lib/server/db.server");
    return rpc<number>("admin_annuler", { _inscription: data.inscription, _atelier: data.atelier });
  });

export const connexionAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ identifiant: z.string().max(100), motDePasse: z.string().max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { verifierIdentifiants, ouvrirSession } =
      await import("@/lib/server/admin-session.server");
    const { verifierQuotaConnexion } = await import("@/lib/server/anti-robot.server");
    if (!(await verifierQuotaConnexion(getRequest().headers))) return { ok: false };
    if (!(await verifierIdentifiants(data.identifiant.trim(), data.motDePasse))) {
      await new Promise((r) => setTimeout(r, 800));
      return { ok: false };
    }
    await ouvrirSession();
    return { ok: true };
  });

export const deconnexionAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { fermerSession } = await import("@/lib/server/admin-session.server");
  await fermerSession();
  return { ok: true };
});
