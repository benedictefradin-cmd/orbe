import { describe, expect, it } from "vitest";
import * as contenus from "@/lib/contenus";
import { formaterSource, MESURES } from "@/lib/mesures";
import { Q, SITUATIONS_ATELIER, LIBELLES_INSCRIPTION } from "@/lib/formulaires";

function textes(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (typeof v === "function") {
    const r = (v as (x: unknown) => unknown)(3);
    if (typeof r === "string") out.push(r);
  } else if (Array.isArray(v)) v.forEach((x) => textes(x, out));
  else if (v && typeof v === "object")
    Object.entries(v).forEach(([k, x]) => {
      if (
        !["url", "site", "newsletter", "contactUrl", "imagePartage", "miseAJour", "ancre"].includes(
          k,
        )
      )
        textes(x, out);
    });
  return out;
}

describe("règles d'écriture des textes visibles", () => {
  const tous = [
    ...textes(contenus),
    ...MESURES.flatMap((m) => [m.texte, m.axe, m.detail ?? "", ...m.sources.map(formaterSource)]),
    ...textes(Q),
    ...textes(SITUATIONS_ATELIER),
    ...textes(LIBELLES_INSCRIPTION),
  ];
  it.each(tous.map((t) => [t]))("%s", (t) => {
    // Deux points autorisés seulement à la française, précédés d'une espace.
    expect(t).not.toMatch(/[^\s\u00a0]:\s/);
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/\s-\s/);
  });
  it.each(tous.map((t) => [t]))("parle de protection de l'enfance, %s", (t) => {
    // Seul le nom de l'association peut contenir le mot.
    expect(t.replaceAll("Face à l'inceste", "")).not.toMatch(/incest/i);
  });
  it("contient bien 24 mesures aux identifiants uniques", () => {
    expect(MESURES).toHaveLength(24);
    expect(new Set(MESURES.map((m) => m.id)).size).toBe(24);
  });
});
