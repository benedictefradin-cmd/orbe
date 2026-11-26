import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoIr from "@/assets/img/logo-institut-rousseau.svg";
import logoFai from "@/assets/img/logo-face-a-l-inceste.png";
import {
  ACCUEIL,
  AIDE,
  METHODE,
  NAVIGATION,
  PARTAGE,
  PIED,
  STRUCTURES,
  SUIVRE,
} from "@/lib/contenus";

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

/** En tête : logos et liens vers les pages dédiées. Menu en tiroir sous 1024 px. */
export function Entete() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <header className="entete" data-vt="entete">
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
        <div className="flex items-center lg:hidden">
          <Sheet open={ouvert} onOpenChange={setOuvert}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="bouton bouton-discret bouton-petit bouton-icone -mr-2"
                aria-label="Ouvrir le menu"
              >
                <Menu aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm" aria-describedby={undefined}>
              <SheetTitle className="surtitre">Menu</SheetTitle>
              <nav className="menu-tiroir mt-4 border-t-2 border-navy" aria-label="Pages du site">
                {NAVIGATION.map((n) => (
                  <Link key={n.chemin} to={n.chemin} onClick={() => setOuvert(false)}>
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

/** Réseaux en liens texte, sans pastille ni icône. */
export function Reseaux({ structure }: { structure: keyof typeof STRUCTURES }) {
  const s = STRUCTURES[structure];
  return (
    <ul className="liens-texte" aria-label={`Réseaux, ${s.nom}`}>
      {s.reseaux.map((r) => (
        <li key={r.url}>
          <LienExterne href={r.url}>{r.nom}</LienExterne>
        </li>
      ))}
    </ul>
  );
}

/** Colophon. Le bloc « Besoin de parler » le précède sur toutes les pages. */
export function PiedDePage() {
  return (
    <>
      <BesoinDeParler id="aide" />
      <footer className="pied">
        <div className="conteneur pied-grille">
          <div className="pied-colophon">
            <Logos lien={false} />
            <p className="meta">Une démarche commune pour la présidentielle 2027.</p>
          </div>
          <div>
            <h2>{STRUCTURES.ir.nom}</h2>
            <Reseaux structure="ir" />
          </div>
          <div>
            <h2>{STRUCTURES.fai.nom}</h2>
            <Reseaux structure="fai" />
          </div>
          <ul className="liens-texte pied-liens md:flex-col" aria-label="Informations">
            <li>
              <Link to="/donnees-personnelles">{PIED.donnees}</Link>
            </li>
            <li>
              <Link to="/methode">{METHODE.lienPied}</Link>
            </li>
            <li>
              <LienExterne href={PIED.contactUrl}>{PIED.contact}</LienExterne>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}

const appeler = (numero: string) => `tel:${numero.replace(/\s/g, "")}`;
const URGENCE = "17";

/** Numéros d'aide, identiques sur toutes les pages, pleine largeur, jamais repliés. */
export function BesoinDeParler({ id }: { id: string }) {
  const titre = `${id}-titre`;
  return (
    <section id={id} className="aide-bande" aria-labelledby={titre}>
      <div className="conteneur aide-bande-grille">
        <div>
          <h2 id={titre} className="aide-titre">
            {AIDE.titre}
          </h2>
          <p className="aide-intro">{AIDE.intro}</p>
        </div>
        <ul className="numeros">
          {AIDE.numeros.map((n) => (
            <li key={n.numero}>
              <a
                href={appeler(n.numero)}
                className="numero-appel"
                aria-label={`Appeler le ${n.numero}, ${n.nom}`}
              >
                {n.numero}
              </a>
              <span>
                <span className="numero-nom">{n.nom}</span>
                {n.texte}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Rappel court des numéros, pour la colonne de repères et le fil des formulaires. */
export function AideCourte({ className = "" }: { className?: string }) {
  return (
    <div className={`aide-courte ${className}`}>
      <p className="aide-titre">{AIDE.titre}</p>
      <ul>
        {AIDE.numeros
          .filter((n) => n.numero !== URGENCE)
          .map((n) => (
            <li key={n.numero}>
              <a
                href={appeler(n.numero)}
                className="numero-appel"
                aria-label={`Appeler le ${n.numero}, ${n.nom}`}
              >
                {n.numero}
              </a>
              <span className="numero-nom">{n.nom}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export function SuivreNosTravaux() {
  return (
    <section className="carte" aria-labelledby="suivre-titre">
      <h2 id="suivre-titre" className="titre-bloc">
        {SUIVRE.titre}
      </h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold">{STRUCTURES.ir.nom}</h3>
          <Reseaux structure="ir" />
          <LienExterne href={STRUCTURES.ir.newsletter} className="lien-fort">
            {SUIVRE.newsletter}
          </LienExterne>
        </div>
        <div>
          <h3 className="text-base font-semibold">{STRUCTURES.fai.nom}</h3>
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
      <h2 id="partage-titre" className="titre-bloc">
        {PARTAGE.titre}
      </h2>
      <p className="texte-long mt-2">{PARTAGE.texte}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={classe} onClick={copier}>
          {copie ? PARTAGE.copie : PARTAGE.copier}
        </button>
        <LienExterne className={classe} href={`https://wa.me/?text=${encodeURIComponent(texte)}`}>
          WhatsApp
        </LienExterne>
        <a className={classe} href={`sms:?&body=${encodeURIComponent(texte)}`}>
          SMS
        </a>
        <LienExterne
          className={classe}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        >
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
