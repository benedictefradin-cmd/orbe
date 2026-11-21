import { getRequestOrigin } from "@/lib/origin.functions";
import { siteUrl } from "@/lib/public-url";
import shareImage from "@/assets/img/fox-friday-share.webp.asset.json";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/fox-friday";
import logoGG from "@/assets/img/logo-green-got-blanc.png.asset.json";
import logoER from "@/assets/img/logo-ecole-reparation-blanc.png.asset.json";
import cover from "@/assets/img/fox-storefront.webp.asset.json";
export const Route = createFileRoute("/")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData: origin }) => ({ meta: [
    { title: "Fox Friday · 27 novembre 2026 — Green-Got" },
    { name: "description", content: "On n'a rien à vous vendre. Bichonnage de chaussures avec l'École de la Réparation, puis pot Green-Got à L'Échappée, Paris, le 27 novembre." },
    { property: "og:title", content: "Fox Friday · Green-Got" },
    { property: "og:description", content: "Le 27 novembre à Paris : prenez soin de vos chaussures et retrouvez-nous au pot à 17 h 30." },
    { property: "og:type", content: "website" },
    ...(origin ? [
      { property: "og:image", content: siteUrl(origin, shareImage.url) },
      { name: "twitter:image", content: siteUrl(origin, shareImage.url) },
    ] : []),
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Fox Friday · Green-Got et l’École de la Réparation" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});
function Index() {
  return <main className="hero landing">
    <img src={cover.url} alt="La vitrine parisienne Green-Got et l’École de la Réparation : On n’a rien à vous vendre." className="hero-photo" fetchPriority="high"/>
    <div className="page-shell hero-inner fade-in">
      <div className="landing-logos"><a href="https://green-got.com" className="logo-chip logo-gg"><img src={logoGG.url} alt="Green-Got"/></a><span aria-hidden="true">×</span><span className="logo-chip"><img src={logoER.url} alt="L’École de la Réparation"/></span></div>
      <h1>Fox <span>Friday.</span></h1>
      <p className="hero-quote">Notre premier pop-up Green-Got, une boutique qui n’a rien à vous vendre.</p>
      <p className="hero-detail">Le jour du Black Friday, les élèves de l’École de la Réparation bichonnent vos chaussures en direct. Puis on trinque.</p>
      <p className="fomo">Places très limitées pour les ateliers</p>
      <p className="fomo italic whitespace-nowrap -mt-2 " style={{ fontSize: "clamp(10px, 2.9vw, 13px)" }}>Inscriptions ouvertes jusqu’au mercredi 25 novembre à 12 h.</p>
      <Button asChild className="hero-action"><Link to="/inscription">Je viens <ArrowUpRight size={17}/></Link></Button>
      <ul className="landing-facts">
        <li><CalendarDays size={15}/>Ven. 27 nov · Ateliers de 12 h 30 à 17 h 10</li>
        <li><MapPin size={15}/>L’Échappée · Paris 4e</li>
        <li><Wine size={15}/>Pot Green-Got à partir de 17 h 30</li>
      </ul>
      <p className="mt-3 text-xs italic opacity-60">Inscrit·e mais un imprévu ? Ça arrive : <Link to="/annuler" className="underline underline-offset-2 hover:opacity-100">libérez votre place ici</Link></p>
    </div>
  </main>;
}
