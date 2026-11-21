import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/** État public du site : fermetures et places restantes, calculés côté serveur. */
export const getEtatSite = createServerFn({ method: "GET" }).handler(async () => {
  const [{ etatSite }, { maintenant }] = await Promise.all([
    import("@/lib/server/services.server"),
    import("@/lib/server/horloge.server"),
  ]);
  try {
    return await etatSite(maintenant());
  } catch (e) {
    console.error(e);
    return await etatSite(maintenant(), false);
  }
});

export const getJetonFormulaire = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ formulaire: z.enum(["consultation", "inscription"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { creerJeton } = await import("@/lib/server/anti-robot.server");
    return creerJeton(data.formulaire);
  });

export const envoyerConsultation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }) => {
    const [{ enregistrerConsultation }, { maintenant }] = await Promise.all([
      import("@/lib/server/services.server"),
      import("@/lib/server/horloge.server"),
    ]);
    return enregistrerConsultation(data, getRequest().headers, maintenant());
  });

export const envoyerInscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }) => {
    const [{ enregistrerInscription }, { maintenant }] = await Promise.all([
      import("@/lib/server/services.server"),
      import("@/lib/server/horloge.server"),
    ]);
    return enregistrerInscription(data, getRequest().headers, maintenant());
  });

const jetonSchema = z.object({ jeton: z.string().uuid() });

export const getInscription = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => jetonSchema.parse(input))
  .handler(async ({ data }) => {
    const { lireInscription } = await import("@/lib/server/services.server");
    return lireInscription(data.jeton);
  });

export const annulerMonInscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => jetonSchema.parse(input))
  .handler(async ({ data }) => {
    const { annulerInscription } = await import("@/lib/server/services.server");
    return annulerInscription(data.jeton);
  });
