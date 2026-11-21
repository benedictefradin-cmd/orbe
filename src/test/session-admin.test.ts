import { beforeEach, describe, expect, it, vi } from "vitest";

const etat = vi.hoisted(() => ({ cookie: "" }));
vi.mock("@tanstack/react-start/server", () => ({
  getCookie: () => etat.cookie,
  setCookie: (_n: string, v: string) => {
    etat.cookie = v;
  },
  deleteCookie: () => {
    etat.cookie = "";
  },
}));
import {
  fermerSession,
  ouvrirSession,
  sessionValide,
  verifierIdentifiants,
} from "@/lib/server/admin-session.server";
import { nouvelleBase } from "./base-de-test";

describe("session admin", () => {
  beforeEach(async () => {
    etat.cookie = "";
    vi.stubEnv("ADMIN_SESSION_SECRET", "cle-de-test-uniquement-0123456789abcdef");
    vi.stubEnv("ADMIN_USERNAME", "orga");
    vi.stubEnv("ADMIN_PASSWORD", "mot-de-passe-solide");
    await nouvelleBase();
  });
  it("vérifie identifiant et mot de passe", async () => {
    expect(await verifierIdentifiants("orga", "mot-de-passe-solide")).toBe(true);
    expect(await verifierIdentifiants("orga", "faux")).toBe(false);
    expect(await verifierIdentifiants("autre", "mot-de-passe-solide")).toBe(false);
  });
  it("refuse tout accès sans variables d'environnement, aucun accès de démonstration", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(await verifierIdentifiants("orga", "")).toBe(false);
  });
  it("une copie du cookie ne marche plus après la déconnexion", async () => {
    await ouvrirSession();
    const copie = etat.cookie;
    expect(await sessionValide()).toBe(true);
    await fermerSession();
    expect(etat.cookie).toBe("");
    etat.cookie = copie;
    expect(await sessionValide()).toBe(false);
  });
  it("refuse un cookie modifié", async () => {
    await ouvrirSession();
    etat.cookie = etat.cookie.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
    expect(await sessionValide()).toBe(false);
  });
});
