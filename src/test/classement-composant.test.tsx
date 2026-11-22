/** Test du composant sans Testing Library (absente des dépendances) : React, act et le DOM de jsdom. */
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Classement } from "@/components/classement";
import { MESURE_IDS, mesureParId } from "@/lib/mesures";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ORDRE = [...MESURE_IDS].reverse();
const texte = (id: string) => mesureParId(id)!.texte;

function Banc({ depart = [] as string[], ordre = ORDRE as readonly string[] | null }) {
  const [v, setV] = useState(depart);
  return <Classement valeur={v} onChange={setV} ordre={ordre} />;
}

let racine: Root | undefined;
let conteneur: HTMLDivElement | undefined;
function afficher(el: React.ReactElement) {
  conteneur = document.createElement("div");
  document.body.append(conteneur);
  racine = createRoot(conteneur);
  act(() => racine!.render(el));
}
afterEach(() => {
  act(() => racine?.unmount());
  conteneur?.remove();
});

const boutons = () => [...document.querySelectorAll<HTMLButtonElement>("button")];
const parNom = (nom: string) => boutons().find((b) => b.getAttribute("aria-label") === nom)!;
const parTexte = (t: string) => boutons().find((b) => b.textContent?.trim() === t)!;
const mesures = () => [...document.querySelectorAll<HTMLButtonElement>("button.mesure")];
const mesure = (id: string) => mesures().find((b) => b.textContent?.includes(texte(id)))!;
const annonce = () => document.querySelector('[role="status"]')!.textContent;
const cliquer = (b: HTMLElement) => act(() => b.click());

describe("classement accessible", () => {
  it("présente les mesures dans l'ordre reçu, et aucune tant que l'ordre n'est pas tiré", () => {
    afficher(<Banc ordre={null} />);
    expect(mesures()).toHaveLength(0);
    expect(document.body.textContent).toContain("Préparation de la liste");
    act(() => racine!.unmount());
    afficher(<Banc />);
    expect(mesures()).toHaveLength(24);
    expect(mesures()[0]?.textContent).toContain(texte("m24"));
    expect(mesures()[23]?.textContent).toContain(texte("m01"));
  });

  it("annonce la position et le texte, sans jamais désactiver un bouton", () => {
    afficher(<Banc />);
    for (const id of ["m01", "m02", "m03", "m04", "m05"]) cliquer(mesure(id));
    expect(annonce()).toBe(`Ajoutée en position 5 sur 5 : ${texte("m05")}`);
    const libre = mesure("m06");
    expect(libre.getAttribute("aria-disabled")).toBe("true");
    libre.focus();
    cliquer(libre);
    expect(document.activeElement).toBe(libre);
    expect(libre.getAttribute("aria-pressed")).toBe("false");
    expect(annonce()).toMatch(/complet/);
    expect(document.querySelectorAll("button:disabled")).toHaveLength(0);
  });

  it("garde le focus sur le même bouton après un déplacement", () => {
    afficher(<Banc depart={["m01", "m02", "m03"]} />);
    const monter = parNom(`Monter, ${texte("m02")}`);
    monter.focus();
    cliquer(monter);
    const premier = document.querySelector("#mon-classement ~ ol li");
    expect(premier?.textContent).toContain(texte("m02"));
    const apres = parNom(`Monter, ${texte("m02")}`);
    expect(document.activeElement).toBe(apres);
    expect(apres.getAttribute("aria-disabled")).toBe("true");
    expect(annonce()).toBe(`Déplacée en position 1 sur 5 : ${texte("m02")}`);
    cliquer(apres);
    expect(annonce()).toMatch(/déjà en première position/);
    expect(document.activeElement).toBe(apres);
  });

  it("après un retrait, focalise le bouton suivant, puis le titre du classement", () => {
    afficher(<Banc depart={["m01", "m02"]} />);
    cliquer(parNom(`Retirer, ${texte("m01")}`));
    expect(document.activeElement).toBe(parNom(`Retirer, ${texte("m02")}`));
    expect(annonce()).toBe(`Retirée de votre classement : ${texte("m01")}`);
    cliquer(parNom(`Retirer, ${texte("m02")}`));
    expect(document.activeElement).toBe(document.getElementById("mon-classement"));
  });

  it("filtre par thème sans changer l'ordre tiré", () => {
    afficher(<Banc />);
    const avant = mesures().map((b) => b.textContent);
    cliquer(parTexte("Justice"));
    const apres = mesures().map((b) => b.textContent);
    expect(apres).toHaveLength(2);
    expect(apres).toEqual(avant.filter((t) => apres.includes(t)));
    expect(parTexte("Justice").getAttribute("aria-pressed")).toBe("true");
    expect(annonce()).toBe("2 mesures affichées.");
    // Aucun détail n'est encore rédigé : aucun bouton « Détails ».
    expect(boutons().some((b) => b.textContent?.startsWith("Détails"))).toBe(false);
  });
});
