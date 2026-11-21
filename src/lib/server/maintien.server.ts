import { egaliteSure } from "./signature.server";
import { entretenirBase } from "./services.server";

/**
 * Point d'entrée de la tâche quotidienne Vercel. Vercel envoie `Authorization: Bearer <CRON_SECRET>`
 * quand la variable CRON_SECRET est définie. Sans elle, la route refuse tout appel.
 */
export async function traiterMaintien(request: Request): Promise<Response> {
  const secret = process.env["CRON_SECRET"];
  const recu = request.headers.get("authorization") ?? "";
  if (!secret || !egaliteSure(recu, `Bearer ${secret}`)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const ateliers = await entretenirBase();
  return Response.json({ ok: true, ateliers });
}
