/** Pages publiques indexables. Administration, annulation et page de capture jamais indexées. */
export const ROBOTS_PRIVE = "noindex, nofollow, noarchive";
export const ROBOTS_PUBLIC = "index, follow";

export function estPrive(chemin: string): boolean {
  return (
    chemin.startsWith("/admin") || chemin.startsWith("/annuler") || chemin.startsWith("/partage")
  );
}

export function protegerIndexation(response: Response, chemin: string): Response {
  if (!estPrive(chemin)) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", ROBOTS_PRIVE);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
