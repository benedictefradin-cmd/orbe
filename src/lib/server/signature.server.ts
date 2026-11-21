/** Signature HMAC SHA 256 avec la clé de session (ADMIN_SESSION_SECRET). */
export function cleSignature(): string {
  const cle = process.env["ADMIN_SESSION_SECRET"];
  if (!cle || cle.length < 32)
    throw new Error("ADMIN_SESSION_SECRET manquante ou trop courte (32 caractères minimum).");
  return cle;
}

export async function signer(contexte: string, valeur: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(cleSignature()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${contexte}:${valeur}`),
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) =>
    c === "+" ? "-" : c === "/" ? "_" : "",
  );
}

export function egaliteSure(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function empreinte(valeur: string): Promise<string> {
  const sel = process.env["IP_HASH_SALT"];
  if (!sel || sel.length < 16)
    throw new Error("IP_HASH_SALT manquant ou trop court (16 caractères minimum).");
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${sel}:${valeur}`));
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
}
