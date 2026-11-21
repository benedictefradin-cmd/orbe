import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { rpc } from "@/lib/server/db.server";
import { egaliteSure, signer } from "@/lib/server/signature.server";

const COOKIE = "consultation_admin";
const DUREE = 60 * 60 * 12; // 12 h

export async function verifierIdentifiants(
  identifiant: string,
  motDePasse: string,
): Promise<boolean> {
  const u = process.env["ADMIN_USERNAME"],
    p = process.env["ADMIN_PASSWORD"];
  if (!u || !p || !process.env["ADMIN_SESSION_SECRET"]) return false;
  const [a, b, c, d] = await Promise.all([
    signer("id", identifiant),
    signer("id", u),
    signer("mdp", motDePasse),
    signer("mdp", p),
  ]);
  return egaliteSure(a, b) && egaliteSure(c, d);
}

export async function ouvrirSession() {
  const exp = Math.floor(Date.now() / 1000) + DUREE;
  const id = crypto.randomUUID();
  await rpc("admin_session_creer", { _id: id, _expire: new Date(exp * 1000).toISOString() });
  const charge = `${exp}.${id}`;
  setCookie(COOKIE, `${charge}.${await signer("session", charge)}`, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    path: "/",
    maxAge: DUREE,
  });
}

async function lireSession() {
  const v = getCookie(COOKIE);
  if (!v || !process.env["ADMIN_SESSION_SECRET"]) return null;
  const morceaux = v.split(".");
  const [exp = "", id = "", sig = ""] = morceaux;
  if (
    morceaux.length !== 3 ||
    !/^\d+$/.test(exp) ||
    Number(exp) <= Date.now() / 1000 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return null;
  if (!egaliteSure(sig, await signer("session", `${exp}.${id}`))) return null;
  return { id };
}

/** Révoque la session en base avant d'effacer le cookie : une copie du cookie ne marche plus. */
export async function fermerSession() {
  const s = await lireSession();
  if (s) await rpc("admin_session_revoquer", { _id: s.id });
  deleteCookie(COOKIE, { path: "/" });
}

export async function sessionValide(): Promise<boolean> {
  const s = await lireSession();
  if (!s) return false;
  return rpc<boolean>("admin_session_valide", { _id: s.id });
}
