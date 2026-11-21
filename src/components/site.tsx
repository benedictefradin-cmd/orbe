import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Linkedin,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Share2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoIr from "@/assets/img/logo-institut-rousseau.svg";
import logoFai from "@/assets/img/logo-face-a-l-inceste.svg";
import { ACCUEIL, AIDE, NAVIGATION, PARTAGE, PIED, STRUCTURES, SUIVRE } from "@/lib/contenus";

export function Logos({ lien = true }: { lien?: boolean }) {
  const contenu = (
    <>
      <img src={logoIr} alt="Institut Rousseau" width={221} height={47} />
      <span className="croix" aria-hidden="true">
        ×
      </span>
      <img src={logoFai} alt="Face à l'inceste" width={200} height={47} />
    </>
  );
  return lien ? (
    <Link to="/" className="logos" aria-label="Accueil, Institut Rousseau et Face à l'inceste">
      {contenu}
    </Link>
  ) : (
    <div className="logos">{contenu}</div>
  );
}

/** En tête : logos, ancres de la page d'accueil, bouton « Je réponds ». Menu en tiroir sur mobile. */
export function Entete({ consultationOuverte = true }: { consultationOuverte?: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <header className="entete">
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <div className="conteneur entete-inner">
        <Logos />
        <nav className="nav-ancres" aria-label="Sections de la page">
          {NAVIGATION.map((n) => (
            <a key={n.ancre} href={`/#${n.ancre}`}>
              {n.libelle}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {consultationOuverte && (
            <Link to="/consultation" className="bouton bouton-plein bouton-petit entete-cta">
              {ACCUEIL.boutonEntete}
            </Link>
          )}
          <Sheet open={ouvert} onOpenChange={setOuvert}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="burger bouton bouton-discret bouton-petit"
                aria-label="Ouvrir le menu"
              >
                <Menu aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm" aria-describedby={undefined}>
              <SheetTitle className="font-titre text-xl text-primaire">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Sections de la page">
                {NAVIGATION.map((n) => (
                  <a
                    key={n.ancre}
                    href={`/#${n.ancre}`}
                    onClick={() => setOuvert(false)}
                    className="flex min-h-12 items-center rounded-md px-3 text-lg font-semibold text-texte no-underline hover:bg-accent-pale"
                  >
                    {n.libelle}
                  </a>
                ))}
              </nav>
              {consultationOuverte && (
                <Link
                  to="/consultation"
                  onClick={() => setOuvert(false)}
                  className="bouton bouton-plein mt-6 w-full"
                >
                  {ACCUEIL.boutonEntete}
                </Link>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function LienExterne({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

export function Reseaux({ structure }: { structure: keyof typeof STRUCTURES }) {
  const s = STRUCTURES[structure];
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`Réseaux, ${s.nom}`}>
      {s.reseaux.map((r) => (
        <li key={r.url}>
          <LienExterne
            href={r.url}
            className="inline-flex min-h-11 items-center rounded-md border border-bordure-forte px-3 text-[15px] font-semibold no-underline hover:border-accent"
          >
            {r.nom}
          </LienExterne>
        </li>
      ))}
    </ul>
  );
}

export function PiedDePage() {
  return (
    <footer className="border-t border-bordure bg-fond-alterne">
      <div className="conteneur grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logos lien={false} />
          <p className="mention">Une démarche commune pour la présidentielle 2027.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-bold">{STRUCTURES.ir.nom}</h2>
          <Reseaux structure="ir" />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-bold">{STRUCTURES.fai.nom}</h2>
          <Reseaux structure="fai" />
        </div>
      </div>
      <div className="conteneur flex flex-wrap gap-x-6 gap-y-2 border-t border-bordure py-6">
        <Link to="/donnees-personnelles" className="inline-flex min-h-11 items-center">
          {PIED.donnees}
        </Link>
        <LienExterne href={PIED.contactUrl} className="inline-flex min-h-11 items-center">
          {PIED.contact}
        </LienExterne>
      </div>
    </footer>
  );
}

/** Numéros d'aide, discrets mais visibles, repris dans les deux formulaires. */
export function BesoinDeParler({ compact = false, id }: { compact?: boolean; id?: string }) {
  return (
    <aside
      id={id}
      className={`rounded-xl border border-ciel bg-accent-pale ${compact ? "p-4" : "p-6"}`}
      aria-labelledby={`${id ?? "aide"}-titre`}
    >
      <h2
        id={`${id ?? "aide"}-titre`}
        className={`font-sans font-bold text-primaire ${compact ? "text-base" : "text-xl"}`}
      >
        {AIDE.titre}
      </h2>
      {!compact && <p className="mt-2">{AIDE.intro}</p>}
      <ul className={`grid gap-3 ${compact ? "mt-3" : "mt-4 sm:grid-cols-3"}`}>
        {AIDE.numeros
          .filter((n) => !compact || n.numero !== "17")
          .map((n) => (
            <li key={n.numero} className="flex items-start gap-3">
              <a
                href={`tel:${n.numero.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 min-w-16 items-center justify-center gap-1 rounded-md bg-white px-3 font-display text-xl font-bold text-primaire no-underline hover:text-accent-survol"
                aria-label={`Appeler le ${n.numero}, ${n.nom}`}
              >
                <Phone size={16} aria-hidden="true" />
                {n.numero}
              </a>
              <span className="text-[15px] leading-snug">
                <strong>{n.nom}</strong>
                <br />
                {n.texte}
              </span>
            </li>
          ))}
      </ul>
    </aside>
  );
}

export function SuivreNosTravaux() {
  return (
    <section className="carte" aria-labelledby="suivre-titre">
      <h2 id="suivre-titre" className="text-2xl">
        {SUIVRE.titre}
      </h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="font-sans text-base font-bold">{STRUCTURES.ir.nom}</h3>
          <Reseaux structure="ir" />
          <LienExterne
            href={STRUCTURES.ir.newsletter}
            className="inline-flex min-h-11 items-center font-semibold"
          >
            {SUIVRE.newsletter}
          </LienExterne>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-sans text-base font-bold">{STRUCTURES.fai.nom}</h3>
          <Reseaux structure="fai" />
        </div>
      </div>
    </section>
  );
}

/** Partage : copier le lien, WhatsApp, SMS, LinkedIn, partage natif si disponible. */
export function Partage() {
  const [url, setUrl] = useState("");
  const [copie, setCopie] = useState(false);
  const [natif, setNatif] = useState(false);
  useEffect(() => {
    setUrl(window.location.origin + "/");
    setNatif(typeof navigator.share === "function");
  }, []);
  const texte = `${PARTAGE.message} ${url}`;
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      /* le lien reste visible */
    }
  };
  const classe = "bouton bouton-contour bouton-petit";
  return (
    <section className="carte" aria-labelledby="partage-titre">
      <h2 id="partage-titre" className="text-2xl">
        {PARTAGE.titre}
      </h2>
      <p className="mt-2">{PARTAGE.texte}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={classe} onClick={copier}>
          {copie ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copie ? PARTAGE.copie : PARTAGE.copier}
        </button>
        <LienExterne className={classe} href={`https://wa.me/?text=${encodeURIComponent(texte)}`}>
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </LienExterne>
        <a className={classe} href={`sms:?&body=${encodeURIComponent(texte)}`}>
          <MessageSquare size={18} aria-hidden="true" />
          SMS
        </a>
        <LienExterne
          className={classe}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        >
          <Linkedin size={18} aria-hidden="true" />
          LinkedIn
        </LienExterne>
        {natif && (
          <button
            type="button"
            className={classe}
            onClick={() => {
              void navigator
                .share({ title: ACCUEIL.titre, text: PARTAGE.message, url })
                .catch(() => {});
            }}
          >
            <Share2 size={18} aria-hidden="true" />
            {PARTAGE.natif}
          </button>
        )}
      </div>
      <p className="sr-only" role="status">
        {copie ? PARTAGE.copie : ""}
      </p>
    </section>
  );
}

export { LienExterne };
