import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Share2,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoIr from "@/assets/img/logo-institut-rousseau.svg";
import logoFai from "@/assets/img/logo-face-a-l-inceste.png";
import { ACCUEIL, AIDE, NAVIGATION, PARTAGE, PIED, STRUCTURES, SUIVRE } from "@/lib/contenus";

export function Logos({ lien = true }: { lien?: boolean }) {
  const contenu = (
    <>
      <img src={logoIr} alt="Institut Rousseau" width={221} height={47} />
      <span className="croix" aria-hidden="true">
        ×
      </span>
      <img src={logoFai} alt="Face à l'inceste" width={322} height={139} className="logo-fai" />
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

/** En tête : logos et liens vers les pages dédiées. Menu en tiroir sur mobile. */
export function Entete() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <header className="entete">
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <div className="conteneur entete-inner">
        <Logos />
        <nav className="nav-ancres" aria-label="Pages du site">
          {NAVIGATION.map((n) => (
            <Link key={n.chemin} to={n.chemin}>
              {n.libelle}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
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
              <nav className="mt-6 flex flex-col gap-1" aria-label="Pages du site">
                {NAVIGATION.map((n) => (
                  <Link
                    key={n.chemin}
                    to={n.chemin}
                    onClick={() => setOuvert(false)}
                    className="flex min-h-12 items-center rounded-md px-3 text-lg font-semibold text-texte no-underline hover:bg-accent-pale"
                  >
                    {n.libelle}
                  </Link>
                ))}
              </nav>
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
  titre,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  titre?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={titre}>
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

/** Logos X et Bluesky, absents de lucide, tracés d'après Simple Icons. */
function LogoPlein({ chemin }: { chemin: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d={chemin} />
    </svg>
  );
}
const LOGO_X =
  "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z";
const LOGO_BLUESKY =
  "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z";
const ICONES: Record<string, LucideIcon> = {
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
  Facebook,
};

function IconeReseau({ nom }: { nom: string }) {
  if (nom === "X") return <LogoPlein chemin={LOGO_X} />;
  if (nom === "Bluesky") return <LogoPlein chemin={LOGO_BLUESKY} />;
  const Icone = ICONES[nom];
  return Icone ? <Icone size={20} aria-hidden="true" /> : null;
}

/** Réseaux en icônes seules, le nom reste lu par les lecteurs d'écran. */
export function Reseaux({ structure }: { structure: keyof typeof STRUCTURES }) {
  const s = STRUCTURES[structure];
  return (
    <ul className="reseaux" aria-label={`Réseaux, ${s.nom}`}>
      {s.reseaux.map((r) => (
        <li key={r.url}>
          <LienExterne href={r.url} className="reseau" titre={r.nom}>
            <IconeReseau nom={r.nom} />
            <span className="sr-only">{r.nom}</span>
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
