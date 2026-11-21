import { describe, expect, it } from "vitest";
import { csvCell, neutraliser, serializeCsv } from "@/lib/csv";

describe("neutralisation des formules", () => {
  it.each([
    "=1+1",
    "+1+1",
    "-1+1",
    "@SUM(1)",
    " =1+1",
    "  @A1",
    "\t=1+1",
    "\r=1+1",
    "\n=1+1",
    "\u0000=1+1",
    "＝1+1",
    "＋1+1",
    "－1+1",
    "＠SUM(1)",
  ])("neutralise %j", (v) => {
    expect(neutraliser(v)).toBe(`'${v}`);
    expect(csvCell(v)).toBe(`"'${v}"`);
  });
  it("laisse le texte normal intact", () => {
    expect(neutraliser("Marie Bénédicte")).toBe("Marie Bénédicte");
    expect(neutraliser("Une mesure = utile")).toBe("Une mesure = utile");
  });
  it("échappe guillemets, séparateurs et retours à la ligne", () => {
    expect(csvCell('Marie; "Bonjour"\nSuite')).toBe('"Marie; ""Bonjour""\nSuite"');
    expect(
      serializeCsv([
        ["a", null],
        ["=b", 2],
      ]),
    ).toBe('"a";""\r\n"\'=b";"2"');
  });
});
