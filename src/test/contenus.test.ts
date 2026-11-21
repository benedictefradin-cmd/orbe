import { describe, expect, it } from "vitest";
import * as contenus from "@/lib/contenus";
import { MESURES } from "@/lib/mesures";
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
    ...MESURES.flatMap((m) => [m.texte, m.axe]),
    ...textes(Q),
    ...textes(SITUATIONS_ATELIER),
    ...textes(LIBELLES_INSCRIPTION),
  ];
  it.each(tous.map((t) => [t]))("%s", (t) => {
    expect(t).not.toMatch(/\s:|:\s/);
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/\s-\s/);
  });
  it("contient bien 24 mesures aux identifiants uniques", () => {
    expect(MESURES).toHaveLength(24);
    expect(new Set(MESURES.map((m) => m.id)).size).toBe(24);
  });
});
