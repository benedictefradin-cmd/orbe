import { createServerFn } from "@tanstack/react-start";
import { getRequest, setCookie } from "@tanstack/react-start/server";
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

/** Résultats agrégés, null tant que RESULTATS_PUBLICS est faux (la page répond alors 404). */
export const getResultatsPublics = createServerFn({ method: "GET" }).handler(async () => {
  const { lireResultatsPublics } = await import("@/lib/server/services.server");
  return lireResultatsPublics();
});

export const getJetonFormulaire = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ formulaire: z.enum(["consultation", "inscription", "suite"]) }).parse(input),
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
    const { cookieParticipation } = await import("@/lib/server/participation.server");
    const now = maintenant();
    const r = await enregistrerConsultation(data, getRequest().headers, now);
    if (r.ok) {
      const c = cookieParticipation(now);
      setCookie(c.nom, c.valeur, c.options);
    }
    return r;
  });

/** Vrai si une réponse a déjà été envoyée depuis ce navigateur (cookie posé par le serveur). */
export const getDejaRepondu = createServerFn({ method: "GET" }).handler(async () => {
  const { aDejaRepondu } = await import("@/lib/server/participation.server");
  return aDejaRepondu(getRequest().headers);
});

export const envoyerContactSuite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }) => {
    const [{ enregistrerContactSuite }, { maintenant }] = await Promise.all([
      import("@/lib/server/services.server"),
      import("@/lib/server/horloge.server"),
    ]);
    return enregistrerContactSuite(data, getRequest().headers, maintenant());
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
