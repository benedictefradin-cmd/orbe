import { beforeEach, describe, expect, it, vi } from "vitest";
import { traiterMaintien } from "@/lib/server/maintien.server";
import { nouvelleBase } from "./base-de-test";

const appel = (authorization?: string) =>
  traiterMaintien(
    new Request("https://exemple.fr/api/maintien", {
      headers: authorization ? { authorization } : {},
    }),
  );

describe("tâche quotidienne de maintien de la base", () => {
  beforeEach(async () => {
    vi.stubEnv("CRON_SECRET", "secret-de-test-uniquement");
    await nouvelleBase();
  });
  it("sollicite la base quand Vercel présente le bon secret", async () => {
    const reponse = await appel("Bearer secret-de-test-uniquement");
    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ ok: true, ateliers: 2 });
  });
  it("refuse un appel sans secret ou avec un mauvais secret", async () => {
    expect((await appel()).status).toBe(401);
    expect((await appel("Bearer faux")).status).toBe(401);
  });
  it("refuse tout appel quand CRON_SECRET n'est pas défini", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await appel("Bearer ")).status).toBe(401);
  });
});
