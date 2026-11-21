import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, LogOut, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OngletAteliers, OngletConsultation } from "@/components/tableau-de-bord";
import { Logos } from "@/components/site";
import {
  annulerAdmin,
  cocherAdmin,
  commenterAdmin,
  connexionAdmin,
  deconnexionAdmin,
  getDonneesAdmin,
} from "@/lib/admin.functions";
import { FUSEAU, NOMBRE_MESURES_A_CLASSER, type AtelierId } from "@/lib/config";
import {
  nomFichier,
  tableauInscriptions,
  tableauReponses,
  telecharger,
  versCsv,
  versXlsx,
  type Tableau,
} from "@/lib/exports";
import { metaPage } from "@/lib/partage";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: metaPage({
      titre: "Tableau de bord · Consultation et ateliers",
      description: "Espace réservé à l'organisatrice.",
      prive: true,
    }),
  }),
  component: PageAdmin,
});

const RAFRAICHISSEMENT_MS = 30_000;
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function PageAdmin() {
  const lire = useServerFn(getDonneesAdmin);
  const cocher = useServerFn(cocherAdmin);
  const commenter = useServerFn(commenterAdmin);
  const annuler = useServerFn(annulerAdmin);
  const deconnecter = useServerFn(deconnexionAdmin);
  const qc = useQueryClient();
  const { data, isLoading, isFetching, error, dataUpdatedAt } = useQuery({
    queryKey: ["admin"],
    queryFn: () => lire(),
    refetchInterval: RAFRAICHISSEMENT_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
  const [erreurAction, setErreurAction] = useState("");
  const rafraichir = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const agir = async (f: () => Promise<unknown>) => {
    setErreurAction("");
    try {
      await f();
    } catch {
      setErreurAction(
        "L'action n'a pas abouti. Votre session a peut être expiré, reconnectez vous.",
      );
    }
    await rafraichir();
  };

  if (isLoading)
    return (
      <main className="conteneur section" aria-busy="true">
        Chargement…
      </main>
    );
  if (error)
    return (
      <main className="conteneur section">
        <p className="encadre-erreur" role="alert">
          Les données ne sont pas disponibles pour l'instant. Vérifiez la connexion à la base, puis
          réessayez.
        </p>
        <button
          type="button"
          className="bouton bouton-plein mt-4"
          onClick={() => void rafraichir()}
        >
          Réessayer
        </button>
      </main>
    );
  if (!data || data.statut !== "ok") return <Connexion onConnecte={() => void rafraichir()} />;

  const exporter = async (
    t: Tableau,
    base: "reponses-consultation" | "inscriptions-ateliers",
    format: "xlsx" | "csv",
  ) => {
    if (format === "csv")
      telecharger(versCsv(t), "text/csv;charset=utf-8", nomFichier(base, "csv"));
    else telecharger(await versXlsx(t), XLSX, nomFichier(base, "xlsx"));
  };
  const reponses = () => tableauReponses(data.reponses, NOMBRE_MESURES_A_CLASSER);
  const inscriptions = () => tableauInscriptions(data.inscriptions, window.location.origin);
  const heure = new Date(dataUpdatedAt).toLocaleTimeString("fr-FR", {
    timeZone: FUSEAU,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main className="min-h-screen bg-fond-alterne pb-16">
      <header className="border-b border-bordure bg-white">
        <div className="conteneur flex flex-wrap items-center justify-between gap-3 py-3">
          <Logos lien={false} />
          <button
            type="button"
            className="bouton bouton-discret bouton-petit"
            onClick={async () => {
              await deconnecter();
              qc.setQueryData(["admin"], { statut: "anonyme" });
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      </header>
      <div className="conteneur pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="titre-section">Tableau de bord</h1>
            <p className="mention mt-1" aria-live="polite">
              Mis à jour à {heure}, actualisation automatique toutes les 30 secondes
            </p>
          </div>
          <button
            type="button"
            className="bouton bouton-contour bouton-petit self-start"
            onClick={() => void rafraichir()}
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
            Actualiser
          </button>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-2" aria-label="Exports">
          <div className="dash-carte">
            <div className="dash-libelle">Consultation, {data.reponses.length} réponses</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="bouton bouton-plein bouton-petit"
                onClick={() => void exporter(reponses(), "reponses-consultation", "xlsx")}
              >
                <Download size={16} aria-hidden="true" />
                Télécharger les réponses (.xlsx)
              </button>
              <button
                type="button"
                className="bouton bouton-contour bouton-petit"
                onClick={() => void exporter(reponses(), "reponses-consultation", "csv")}
              >
                .csv
              </button>
            </div>
          </div>
          <div className="dash-carte">
            <div className="dash-libelle">Ateliers, {data.inscriptions.length} personnes</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="bouton bouton-plein bouton-petit"
                onClick={() => void exporter(inscriptions(), "inscriptions-ateliers", "xlsx")}
              >
                <Download size={16} aria-hidden="true" />
                Télécharger les inscriptions (.xlsx)
              </button>
              <button
                type="button"
                className="bouton bouton-contour bouton-petit"
                onClick={() => void exporter(inscriptions(), "inscriptions-ateliers", "csv")}
              >
                .csv
              </button>
            </div>
          </div>
        </section>

        {erreurAction && (
          <p className="encadre-erreur mt-4" role="alert">
            {erreurAction}
          </p>
        )}

        <Tabs defaultValue="ateliers" className="mt-8">
          <TabsList className="inline-flex gap-1 rounded-lg border border-bordure bg-white p-1">
            <TabsTrigger
              value="ateliers"
              className="min-h-11 rounded-md px-5 font-semibold data-[state=active]:bg-accent data-[state=active]:text-white"
            >
              Ateliers
            </TabsTrigger>
            <TabsTrigger
              value="consultation"
              className="min-h-11 rounded-md px-5 font-semibold data-[state=active]:bg-accent data-[state=active]:text-white"
            >
              Consultation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ateliers" className="mt-4">
            <OngletAteliers
              donnees={data}
              actions={{
                cocher: (inscription, atelier, champ, valeur) =>
                  agir(() => cocher({ data: { inscription, atelier, champ, valeur } })),
                commenter: (inscription, texte) =>
                  agir(() => commenter({ data: { inscription, texte } })),
                annuler: async (inscription, atelier: AtelierId | null, nom) => {
                  if (
                    window.confirm(
                      `Annuler l'inscription de ${nom} ? La première personne en liste d'attente prendra la place.`,
                    )
                  )
                    await agir(() => annuler({ data: { inscription, atelier } }));
                },
              }}
            />
          </TabsContent>
          <TabsContent value="consultation" className="mt-4">
            <OngletConsultation donnees={data} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Connexion({ onConnecte }: { onConnecte: () => void }) {
  const connexion = useServerFn(connexionAdmin);
  const [erreur, setErreur] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  return (
    <main id="contenu" className="conteneur section max-w-md">
      <Logos lien={false} />
      <h1 className="titre-section mt-8">Tableau de bord</h1>
      <p className="mention mt-2">Espace réservé à l'organisatrice.</p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setEnvoi(true);
          setErreur(false);
          const f = new FormData(e.currentTarget);
          try {
            const r = await connexion({
              data: {
                identifiant: String(f.get("identifiant")),
                motDePasse: String(f.get("motDePasse")),
              },
            });
            if (r.ok) onConnecte();
            else setErreur(true);
          } catch {
            setErreur(true);
          } finally {
            setEnvoi(false);
          }
        }}
      >
        <div className="champ">
          <label htmlFor="identifiant" className="etiquette">
            Identifiant
          </label>
          <input
            id="identifiant"
            name="identifiant"
            autoComplete="username"
            required
            className="saisie"
          />
        </div>
        <div className="champ">
          <label htmlFor="motDePasse" className="etiquette">
            Mot de passe
          </label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            className="saisie"
          />
        </div>
        {erreur && (
          <p className="erreur" role="alert">
            Identifiant ou mot de passe incorrect.
          </p>
        )}
        <button type="submit" className="bouton bouton-plein" disabled={envoi} aria-busy={envoi}>
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
