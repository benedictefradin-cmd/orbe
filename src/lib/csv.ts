/**
 * Neutralise les saisies qui ressemblent à une formule de tableur
 * (= + - @, y compris précédés d'espaces ou de caractères de contrôle) en les préfixant d'une apostrophe.
 */
export function neutraliser(valeur: unknown): string {
  const texte = String(valeur ?? "");
  // eslint-disable-next-line no-control-regex -- les caractères de contrôle en tête font partie de la protection
  const formule = /^[\s\u0000-\u001f\u007f]*[=+@\-＝＋－＠]/u.test(texte);
  return formule ? `'${texte}` : texte;
}

export function csvCell(value: unknown): string {
  return `"${neutraliser(value).replace(/"/g, '""')}"`;
}

/** Point virgule comme séparateur, pour une ouverture directe dans Excel en français. */
export function serializeCsv(rows: readonly (readonly unknown[])[]): string {
  return rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
}
